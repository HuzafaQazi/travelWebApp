import Image from "next/image";
import styles from "./style.module.css";
import Navigation from "../Navigation";
import StarRating from "@/components/starRating";

const FirstPage = (props) => {
  const divStyle = {
    backgroundImage: `url(${props.banner_image})`, // Pass the dynamic background image URL here
  };

  return (
    <div className={`${styles["first-page"]}`} id={styles["full-screen"]}>
      <Image
        className={styles.firstPagebg}
        src={props.banner_image}
        alt="banner_image"
        width={2000}
        height={800}
      />
      <div className={styles.NavigationCommons}>
        <Navigation />
      </div>

      <div className={styles.content}>
        <div className={styles["mobile-head-rate"]}>
          <div className={styles["mobile-head"]}>
            <div className={styles["heading-row"]}>{props.title}</div>
            <div
              className={styles["heading-row"]}
              style={{ marginTop: "-5px" }}
            >
              {props.countryname}, {props.cityname}
            </div>
          </div>

          <div className={styles["stars-and-reviews"]}>
            <StarRating
              rating={props.ratings}
              starRatedColor="#f8d64e"
              starEmptyColor="#cccccc"
              starDimension="20px"
              starSpacing="2px"
              numberOfStars={5}
              //   name={`rating-${index}`}
            />
            <div className={styles["rating"]}>
              {props.ratings} ({props.reviews_count} reviews)
            </div>
          </div>
        </div>

        <div className={styles["mobile-first-icons"]}>
          <Image
            src="/img/clarity_truck-line.png"
            alt="Icon 1"
            width={100}
            height={100}
            className={styles["small-icon"]}
          />
          <Image
            src="/img/game-icons_meal.png"
            alt="Icon 2"
            width={100}
            height={100}
            className={styles["small-icon"]}
          />
          <Image
            src="/img/ion_home-outline.png"
            alt="Icon 3"
            width={100}
            height={100}
            className={styles["small-icon"]}
          />
          <Image
            src="/img/mobile-binoculars.png"
            alt="Icon 4"
            width={100}
            height={100}
            className={styles["small-icon"]}
          />
          <div className={styles["small-vertical-rule"]}></div>
          <Image
            src="/img/carbon_location.png"
            alt="Icon 5"
            width={100}
            height={100}
            className={styles["small-icon"]}
          />
          <div className={styles["text-with-icon"]}>{props.countryname}</div>
          <div className={styles["small-vertical-rule"]}></div>
          <Image
            src="/img/ion_time-outline.png"
            alt="Icon 6"
            width={100}
            height={100}
            className={styles["small-icon"]}
          />
          <div className={styles["text-with-icon"]}>
            {props.no_of_days}D/{props.no_of_nights}N
          </div>
        </div>
        {/* mobile content ends */}

        <div className={styles["img-pattern"]}>
          {props.gallery_images.map((imageSrc, index) => (
            <div
              key={index}
              className={`${styles[`box${index + 1}`]} ${styles.allBoxStyling}`}
            >
              <Image
                className={styles[`box${index + 1}Bg`]}
                src={imageSrc}
                alt={`box${index + 1}`}
                width={500}
                height={500}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FirstPage;
