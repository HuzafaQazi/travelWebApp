import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import testimonialBg from "../../../public/img/testimonial1.png";
import styles from "./style.module.css";

import StarRatings from "react-star-ratings";

const SeventhPage = ({ testimonials }) => {
  // ratings
  const [starDimension, setStarDimension] = useState("20px");

  useEffect(() => {
    const handleResize = () => {
      const newStarDimension = window.innerWidth < 768 ? "15px" : "15px";
      setStarDimension(newStarDimension);
    };
    window.addEventListener("resize", handleResize);
    const initialStarDimension = window.innerWidth < 768 ? "10px" : "10px";
    setStarDimension(initialStarDimension);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={styles["seventh-page"]}>
      <div className={styles["seventh-head"]}>
        <center>
          <h2>Testimonials</h2>
        </center>
        <center>
          <hr />
        </center>
      </div>
      <div className={styles["seventh-container"]}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className={styles.testimonials}>
            <Link href="#">
              <Image
                src={testimonialBg}
                className={styles.testimonialBg}
                alt={testimonial.user_name}
                width={300}
                height={300}
              />
            </Link>
            <div className={styles.testimonialContent}>
              <div className={styles.reviewImg}>
                <Image
                  className={styles.testimonialReviewImg}
                  src={testimonial.image}
                  alt="review"
                  width={300}
                  height={300}
                />
              </div>
              <div className={styles.reviewerDetails}>
                <div className={styles.reviewerImg}>
                  <Image
                    style={{ borderRadius: "25px" }}
                    src={testimonial.user_image}
                    alt={testimonial.user_name}
                    width={300}
                    height={300}
                  />
                </div>
                <div className={styles.reviewerNameStars}>
                  <span>{testimonial.user_name}</span>
                  <div className={styles.rating}>
                    <StarRatings
                      rating={testimonial.user_rating}
                      starRatedColor="#ffff00"
                      starEmptyColor="#ffffff"
                      starDimension={starDimension}
                      starSpacing="1px"
                      numberOfStars={5}
                    />
                  </div>
                </div>
              </div>
              <div
                className={`${styles.reviewDesc} ${styles.truncateReview}`}
                dangerouslySetInnerHTML={{ __html: testimonial.user_review }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeventhPage;
