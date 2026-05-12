import { useState, useEffect } from "react";
import styles from "./style.module.css";
import VerticalSlides from "./VerticalSlides";
import Image from "next/image";
import Link from "next/link";
// import qugoLogo from "../../../../public/img/Qugo Logo mobile.png";
import qugoLogo from "../../../public/img/Qugo Logo mobile.png";
import borderart from "../../../public/img/topattractionsArt.png";
import Loader from "@/components/loader/loader";
import { redirectPackageDetail } from "../../../utils/pageredirection";
import { useRouter } from "next/router";
import StarRatings from "react-star-ratings";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";

const FourthPage = ({ top_selling_packages }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, 'top_selling_activities', {
      country: country_name,
      title:title
    })
  };

  const [starDimension, setStarDimension] = useState("15px");

  useEffect(() => {
    const handleResize = () => {
      const newStarDimension = window.innerWidth < 768 ? "15px" : "15px";
      setStarDimension(newStarDimension);
    };
    window.addEventListener("resize", handleResize);
    const initialStarDimension = window.innerWidth < 768 ? "15px" : "15px";
    setStarDimension(initialStarDimension);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={styles["fourth-page"]}>
      <div className={styles["fourth-head"]}>
        <h2>Top Selling Activities</h2>
        <center>
          <hr />
        </center>
      </div>
      <div className={styles["upper-circles"]}>
        {top_selling_packages.activities.map((item) => (
          <div className={styles["small-circles"]} key={item.id}>
            <div className={styles["circle-img"]}>
              <Link href="#">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={100}
                  height={100}
                />
              </Link>
            </div>
            <div className={styles["circle-text"]}>
              <span className={styles["ellipse-desc"]}>{item.title}</span>
            </div>
          </div>
        ))}
      </div>

      {loading && <Loader />}

      <div className={styles["second-carousel"]}>
        <VerticalSlides>
          {top_selling_packages.packages.map((item) => (
            <div
              key={item.id}
              className={styles["slide-cards"]}
              onClick={() =>
                handleRedirect(item.id, item.title, item.country_name)
              }
            >
              <Image
                className={styles.topVerticalBg}
                src={item.thumbnail_image}
                alt={item.title}
                width={1000}
                height={300}
              />
              <div className={styles.activitiesCardContent}>
                <div className={styles.activitiesCardTopContent}>
                  <div className={styles.logo}>
                    <Image
                      className={styles.qugoLogo}
                      src={qugoLogo}
                      alt="logo"
                    />
                  </div>
                  <div className={styles.activitiesCardtripDuration}>
                    <div className={styles.activitiesCardDays}>
                      {item.no_of_days}D/{item.no_of_nights}N
                    </div>
                  </div>
                </div>
                <div className={styles.activitiesCardBottomContent}>
                  <div className={styles.activitiesCardLeft}>
                    <Image
                      className={styles.BorderArt}
                      src={borderart}
                      alt="border country art"
                      width={100}
                      height={150}
                    />
                  </div>
                  <div className={styles.activitiesCardRight}>
                    <div className={styles.artPackageName}>
                      {item.title}, {item.city_name}
                    </div>
                    <div className={styles.relatedPackagesRating}>
                      <div className={styles.starRatingsContainer}>
                        <StarRatings
                          rating={item.ratings}
                          starRatedColor="#ffffff"
                          starEmptyColor="#333333"
                          starDimension={starDimension}
                          starSpacing="1px"
                          numberOfStars={5}
                          style={{ marginTop: "20px" }}
                          className={styles.starRatings}
                        />
                        <div className={styles.starsAligns}>
                          {item.ratings}
                          {item.reviews_count &&
                            ` (${item.reviews_count} reviews)`}
                        </div>
                      </div>
                    </div>
                    <div className={styles.toprating}>
                      <div className={styles.topbookButton}>
                        <button className={styles.topbookbtn}>Book Now</button>
                      </div>
                      <div className={styles.artCountryName}>
                        {item.country_name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </VerticalSlides>
      </div>
    </div>
  );
};

export default FourthPage;
