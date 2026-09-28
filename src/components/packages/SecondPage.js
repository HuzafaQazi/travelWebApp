import styles from "./style.module.css";
import NextImage from "next/image";
import Loader from "@/components/loader/loader";
import { redirectPackageDetail } from "../../../utils/pageredirection";
import { useState } from "react";
import { useRouter } from "next/router";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";

const SecondPage = ({ popular_packages }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, "popular_packages", {
      country: country_name,
      title: title,
    });
  };

  return (
    <>
      {loading && <Loader />}

      <div className={styles["second-page"]}>
        <div className={styles["second-head"]}>
          <h2>Popular Packages</h2>
          <hr />
        </div>

        <div className={styles["popular-Bg"]}>
          <div className={styles["cards1"]}>
            {popular_packages.map((pack, index) => (
              <div
                key={index}
                className={styles.card}
                onClick={() =>
                  handleRedirect(pack.id, pack.title, pack.country_name)
                }
              >
                <NextImage
                  className={styles.popCardBg}
                  src={pack.thumbnail_image}
                  alt=""
                  width={350}
                  height={350}
                />
                <div className={styles.popularCardContent}>
                  <div className={styles.popTopContent}>
                    <NextImage
                      className={styles.popLogo}
                      src="/img/weyngo_logo_white.png"
                      alt="WeynGo logo"
                      width={65}
                      height={20}
                    />
                    <div className={styles.tripDuration}>
                      <div className={styles.noOfDays}>{pack.no_of_days}D</div>
                      <div className={styles.noOfNights}>
                        {pack.no_of_nights}N
                      </div>
                    </div>
                  </div>
                  <div className={styles.popBottomContent}>
                    <span className={styles.popAbout}>
                      {pack.title} - <br /> {pack.country_name},{" "}
                      {pack.city_name}
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
