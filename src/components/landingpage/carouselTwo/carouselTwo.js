import styles from "./styles.module.css";
import Image from "next/image";
import { useRef } from "react";
import weyngoLogo from "../../../../public/img/weyngo_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { redirectPackageDetail } from "../../../../utils/pageredirection";
import { LazyLoadImage } from "react-lazy-load-image-component";
import SkeletonLoader from "@/components/loader/SkeletonLoader";

export default function SecondCarousel({ top_destinations }) {
  const carouselTrackRef = useRef(null);

  const handleCarouselScroll = (direction) => {
    let scrollAmount = 700; // Adjust the scroll amount as needed
    if (window.innerWidth <= 550) {
      scrollAmount = 400;
    }

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

  return (
    <>
      {top_destinations?.length > 0 && (
        <div className={styles.carouseltwo}>
          <div className={styles.topHeading}>
            Top <span className={styles.qugoColor}>WeynGo</span> Destinations
          </div>
          <div className={styles.headingUnderline}></div>
          <div className={styles.topDestinations}>
            <div className={styles.carousel} ref={carouselTrackRef}>
              {top_destinations.map((destination) => (
                <div key={destination.id} className={styles.card}>
                  <LazyLoadImage
                    className={styles.packageCardBg}
                    src={destination.thumbnail_image}
                    alt={destination.title}
                    width={600}
                    height={300}
                    placeholder={<SkeletonLoader />}
                  />

                  <Link
                    href={redirectPackageDetail(
                      destination.id,
                      destination.title,
                      destination.country_name
                    )}
                  >
                    <div className={styles.CardContent}>
                      <div className={styles.topContent}>
                        <div className={styles.logo}>
                          <Image
                            className={styles.qugoLogo}
                            src={weyngoLogo}
                            alt="WeynGo logo"
                          />
                        </div>
                        <div className={styles.countryName}>
                          {destination.city_name}
                        </div>
                        <div className={styles.tripDuration}>
                          <h4 className={styles.noOfDays}>
                            {destination.no_of_days}D
                          </h4>
                          <hr className={styles.horizontalRule} />
                          <h4 className={styles.noOfDays}>
                            {destination.no_of_nights}N
                          </h4>
                        </div>
                      </div>
                      {destination.offer_percentage && (
                        <div className={styles.offerOnCard}>
                          Book this package now & <br /> get{" "}
                          {destination.offer_percentage}% off.
                        </div>
                      )}
                    </div>
                  </Link>
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
      )}
    </>
  );
}
