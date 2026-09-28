import Image from "next/image";
import styles from "./style.module.css";
import { useState } from "react";
import { useRouter } from "next/router";
import Loader from "@/components/loader/loader";
import { redirectPackageDetail } from "../../../utils/pageredirection";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";

const SecondPage = ({ countryname, description, top_seller_packages, gallery_images }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics,'Top_seller_travelguide',{
      package_id: id,
      package_title: title,
      countryname: country_name
    })
  };

  const handleClick = (imageNumber) => {
    // Your click event logic here
    console.log(`Clicked on image ${imageNumber}`);
  };

  return (
    <>
      {loading && <Loader />}

      <div className={styles["second-page"]}>
        <div className={styles["second-heading"]}>
          <div className={styles["vertical-second"]}></div>
          <h1>{countryname} Beaches</h1>
          <p dangerouslySetInnerHTML={{ __html: description }}></p>
        </div>

        <div className={styles["content"]}>
          <div className={styles["img-pattern"]}>
            {gallery_images.map((imageSrc, index) => (
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

          <div className={styles["top-sellers"]}>
            <h1>Top Sellers of {countryname}</h1>
            <div className={styles["horizontal"]}></div>
          </div>

          <div className={styles["cards"]}>
            {top_seller_packages.map((item) => (
              <div
                className={styles["card1"]}
                key={item.id}
                onClick={() =>
                  handleRedirect(item.id, item.title, item.country_name)
                }
              >
                <Image
                  className={styles.popCardBg}
                  src={item.thumbnail_image}
                  alt={item.title}
                  width={350}
                  height={350}
                  onClick={() => handleClick(index + 1)}
                />
                <div className={styles.popularCardContent}>
                  <div className={styles.popTopContent}>
                    <Image
                      className={styles.popLogo}
                      src="/img/weyngo_logo_white.png"
                      alt="WeynGo Logo"
                      width={60}
                      height={20}
                    />
                    <div className={styles.tripDuration}>
                      <div className={styles.noOfDays}>{item.no_of_days}D</div>
                      <div className={styles.noOfNights}>
                        {item.no_of_nights}N
                      </div>
                    </div>
                  </div>
                  <div className={styles.popBottomContent}>
                    <span className={styles.popAbout}>
                      {item.title} - <br /> {item.country_name},{" "}
                      {item.city_name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SecondPage;
