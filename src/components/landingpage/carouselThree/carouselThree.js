import styles from "./styles.module.css";
import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { redirectPackageDetail } from "../../../../utils/pageredirection";
import StarRatings from "react-star-ratings";
import Loader from "@/components/loader/loader";
import { useRouter } from "next/router";
import SkeletonLoader from "@/components/loader/SkeletonLoader";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";

export default function Unexplored({ explore_the_unexplored }) {
  const router = useRouter();

  const [starDimension, setStarDimension] = useState("15px");
  const [loading, setLoading] = useState(false);

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

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, "carousel_redirect", {
      country_name: country_name,
      title: title,
    });
  };

  if (loading) {
    return <Loader />;
  }

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      {explore_the_unexplored?.length > 0 && (
        <div className={styles.unexplored}>
          <h2 className={styles.topHeading}>Explore The Unexplored</h2>
          <div className={styles.headingUnderline}></div>
          {loading && <Loader />}
          <div className={styles.unexploreCarousel}>
            {explore_the_unexplored.map((place) => {
              const description = place.description.slice(0, 80);
              const descriptionWithoutTags = description.replace(
                /(<([^>]+)>)/gi,
                ""
              );
              const showEllipsis = place.description.length > 80;

              return (
                <div key={place.id} className={styles.unexploreCard}>
                  <div className={styles.cardContent}>
                    <div className={styles.header}>
                      <div className={styles.title}>
                        {place.title},
                        <br /> {place.city_name}
                      </div>
                      <div className={styles.favoriteIcon}>
                        <i class="fa-solid fa-heart"></i>
                      </div>
                    </div>

                    <div className={styles.rating}>
                      <StarRatings
                        rating={place.ratings}
                        starRatedColor="#333333"
                        starEmptyColor="#cccccc"
                        starDimension={starDimension}
                        starSpacing="1px"
                        numberOfStars={5}
                      />
                      <div className={styles.starsAlign}>
                        {place.ratings}
                        {place.reviews_count &&
                          ` (${place.reviews_count} reviews)`}
                      </div>
                    </div>
                    <div className={styles.parkImage}>
                      <Link
                        href={redirectPackageDetail(
                          place.id,
                          place.title,
                          place.country_name
                        )}
                      >
                        <LazyLoadImage
                          className={styles.exploreImage}
                          src={place.thumbnail_image}
                          alt={place.title}
                          width={500}
                          height={500}
                          placeholder={<SkeletonLoader />}
                        />
                      </Link>
                    </div>
                    <div className={styles.location}>
                      Starting from New Delhi
                    </div>
                    <div className={styles.bookDetails}>
                      <div className={styles.leftColumn}>
                        <div className={styles.topText}>
                          {showEllipsis ? (
                            <div>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: descriptionWithoutTags,
                                }}
                              ></span>
                              <span className={styles.ellipsis}>...</span>
                            </div>
                          ) : (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: descriptionWithoutTags,
                              }}
                            ></span>
                          )}
                        </div>
                      </div>
                      <div className={styles.rightColumn}>
                        <div className={styles.priceTag}>
                          {place.offer_price ? (
                            <>
                              <span className={styles.strikeThroughPrice}>
                                Rs. {formatPrice(place.price)}
                              </span>
                              <span className={styles.discountedPrice}>
                                Rs. {formatPrice(place.offer_price)}
                              </span>
                            </>
                          ) : (
                            <span className={styles.discountedPrice}>
                              Rs. {formatPrice(place.price)}
                            </span>
                          )}
                        </div>
                        <button
                          className={styles.bookNowButton}
                          onClick={() =>
                            handleRedirect(
                              place.id,
                              place.title,
                              place.country_name
                            )
                          }
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
