import { useEffect, useState } from "react";
import StarRatings from "react-star-ratings";
import Image from "next/image";
import styles from "./style.module.css";

const ThirdPage = ({ reviewsRef }) => {
  const [starDimension, setStarDimension] = useState("20px");

  useEffect(() => {
    const handleResize = () => {
      const newStarDimension = window.innerWidth < 768 ? "15px" : "20px";
      setStarDimension(newStarDimension);
    };

    // Add event listener to handle window resize
    window.addEventListener("resize", handleResize);

    // Initial setting based on window width
    const initialStarDimension = window.innerWidth < 768 ? "15px" : "20px";
    setStarDimension(initialStarDimension);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // Sample reviews data
  const reviewsData = [
    {
      name: "Sakshi Saraf",
      totalSpend: "INR 28,000",
      totalReview: 19,
      rating: 4,
      review:
        "Itinerary was well planned with super helpful points of contact. Hotel locations were perfect and we could walk to most of the city attractions. Highly recommendable tour package for Phuket Krabi and Phi Phi Islands.",
      tripImgSrc: "/img/first review image.png",
    },
    {
      name: "Lokesh Sharma",
      totalSpend: "INR 28,000",
      totalReview: 19,
      rating: 5,
      review:
        "This is my second international trip through Thrillophillia. Mr. Divyanshu has been extremely helpful in providing the right itinerary and suggestions which made the trip amazing and to be remembered.",
      tripImgSrc: "/img/second-review-img.png",
    },
    // Add more review data as needed...
  ];

  return (
    <div className={styles["third-page"]} id="reviews" ref={reviewsRef}>
      <center>
        <h2 className={styles["head-style"]}>Reviews</h2>
      </center>
      <center>
        <hr />
      </center>

      {/* Review page head */}
      <div className={styles.reviews}>
        <div className={styles["left-part"]}>
          <h2>Total Reviews</h2>
          <h3>10.2K</h3>
          <p>Growth in reviews this year</p>
        </div>
        <div className={styles["center-part"]}>
          <div className={styles["center-heading"]}>
            <h2>Average Ratings</h2>
          </div>
          <div className={styles["average-rating"]}>
            <h3>4.2</h3>
            <div id={styles["rating-container"]} style={{ height: "40px" }}>
              <StarRatings
                rating={4.2}
                starRatedColor="#f8d64e"
                starEmptyColor="#cccccc"
                starDimension={starDimension}
                starSpacing="2px"
                numberOfStars={5}
              />
            </div>
          </div>
          <div className={styles["about-rating"]}>
            <p>Average ratings on this year</p>
          </div>
        </div>
        <div className={styles["right-part"]}>
          <div className={styles["rating-bars"]}>
            <Image
              src="/img/review stars.png"
              alt=""
              width={100}
              height={100}
            />
          </div>
        </div>
      </div>

      {/* Display individual reviews */}
      {reviewsData.map((review, index) => (
        <div key={index} className={styles.review1}>
          <div className={styles["left-column"]}>
            <div className={styles["review-image"]}>
              <Image src={review.tripImgSrc} alt="" width={100} height={100} />
            </div>
            <div className={styles["spent-details"]}>
              <h2>{review.name}</h2>
              <p>
                Total Spend: <strong>{review.totalSpend}</strong>
              </p>
              <p>
                Total Review: <strong>{review.totalReview}</strong>
              </p>
              <StarRatings
                rating={review.rating}
                starRatedColor="#f8d64e"
                starEmptyColor="#cccccc"
                starDimension={starDimension}
                starSpacing="2px"
                numberOfStars={5}
                name={`rating-review1-${index}`}
              />
            </div>
          </div>
          <div className={styles["middle-column"]}>
            <StarRatings
              rating={review.rating}
              starRatedColor="#f8d64e"
              starEmptyColor="#cccccc"
              starDimension={starDimension}
              starSpacing="2px"
              numberOfStars={5}
              name={`rating-review1-${index}`}
            />
            <div className={styles.written1}>
              <p>{review.review}</p>
            </div>
            <div className={styles["review-buttons"]}>
              <button className={styles["left-button"]}>Public Comment</button>
              <button className={styles["center-button"]}>
                Direct Message
              </button>
              <button className={styles["heart-button"]}>&#10084;</button>
            </div>
          </div>
          <div className={styles["right-column"]}>
            <div className={styles["trip-img"]}>
              <Image
                src={review.tripImgSrc}
                alt="img"
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>
      ))}

      <center>
        <button className={styles["show-more"]}>Show more</button>
      </center>
    </div>
  );
};

export default ThirdPage;
