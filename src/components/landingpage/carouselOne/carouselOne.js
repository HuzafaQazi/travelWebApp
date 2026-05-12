import styles from "./styles.module.css";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import StarRatings from "react-star-ratings";

import { redirectPackageDetail } from "../../../../utils/pageredirection";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import SkeletonLoader from "@/components/loader/SkeletonLoader";

export default function FirstCarousel({ international_trips }) {
  const router = useRouter();
  const carouselTrackRef = useRef(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCarouselScroll = (direction) => {
    const scrollAmount = 300; // Adjust the scroll amount as needed

    if (carouselTrackRef.current) {
      const currentScrollLeft = carouselTrackRef.current.scrollLeft;
      const maxScrollLeft =
        carouselTrackRef.current.scrollWidth -
        carouselTrackRef.current.clientWidth;

      if (direction === "prev" && currentScrollLeft > 0) {
        // Scroll to the left
        carouselTrackRef.current.scrollLeft = Math.max(
          0,
          currentScrollLeft - scrollAmount
        );
      } else if (direction === "next" && currentScrollLeft < maxScrollLeft) {
        // Scroll to the right
        carouselTrackRef.current.scrollLeft = Math.min(
          maxScrollLeft,
          currentScrollLeft + scrollAmount
        );
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

  // ratings
  const [starDimension, setStarDimension] = useState("20px");

  useEffect(() => {
    const handleResize = () => {
      const newStarDimension = window.innerWidth < 768 ? "15px" : "15px";
      setStarDimension(newStarDimension);
    };

    // Add event listener to handle window resize
    window.addEventListener("resize", handleResize);

    // Initial setting based on window width
    const initialStarDimension = window.innerWidth < 768 ? "10px" : "10px";
    setStarDimension(initialStarDimension);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleCardClick = (card, id, title, country_name) => {
    setSelectedCard(card);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      {international_trips?.length > 0 && (
        <div className={styles.carouselone}>
          <h2 className={styles.internationalHeading}>International Trips</h2>
          <div className={styles.headingUnderline}></div>
          <div className={styles.tripsContainer}>
            <div className={styles.carouselTrack} ref={carouselTrackRef}>
              <LazyLoadComponent placeholder={<SkeletonLoader />}>
                {international_trips.map((trip) => (
                  <div key={trip.id} className={styles.card}>
                    <Image
                      className={styles.thailandbg}
                      src={trip.thumbnail_image}
                      alt={trip.title}
                      height={700}
                      width={600}
                    />

                    <Link
                      style={{ textDecoration: "none", color: "white" }}
                      href={redirectPackageDetail(
                        trip.id,
                        trip.title,
                        trip.country_name
                      )}
                    >
                      <div className={styles.thailandContent}>
                        <div
                          className={styles.topContent}
                          dangerouslySetInnerHTML={{ __html: trip.description }}
                        ></div>
                        <div className={styles.bottomContent}>
                          <div className={styles.verticalBorder}>
                            <h2 className={styles.cardheading}>
                              {trip.country_name}
                            </h2>
                            <div className={styles.rating}>
                              <StarRatings
                                rating={trip.ratings}
                                starRatedColor="#ffffff"
                                starEmptyColor="#333333"
                                starDimension={starDimension}
                                starSpacing="1px"
                                numberOfStars={5}
                                style={{ marginTop: "20px" }}
                              />
                              <div className={styles.starsAlign}>
                                {trip.ratings}
                                {trip.reviews_count &&
                                  ` (${trip.reviews_count} reviews)`}
                              </div>
                            </div>
                          </div>
                          <div className={styles.priceBox}>
                            <div className={styles.Packageprice}>
                              Rs.
                              {formatPrice(
                                trip.offer_price ? trip.offer_price : trip.price
                              )}
                            </div>
                            <div className={styles.bookButton}>
                              <button className={styles.bookbtn}>
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </LazyLoadComponent>
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
