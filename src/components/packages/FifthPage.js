import { useState } from "react";
import styles from "./style.module.css";
import Image from "next/image";
import Link from "next/link";
import fifthBg from "../../../public/img/fifth-bg.png";
import Loader from "@/components/loader/loader";
import { redirectPackageDetail } from "../../../utils/pageredirection";
import { useRouter } from "next/router";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";

const FifthPage = ({ country_name, all_packages }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, 'newly_added_experiences', {
      country: country_name,
      title:title
    })
  };

  return (
    <>
      {loading && <Loader />}
      <div className={styles["fifth-page"]}>
        <div className={styles["fifth-head"]}>
          <h2>Newly Added {country_name} Experiences</h2>
          <center>
            <hr />
          </center>
        </div>
        <div className={styles["fifth-body"]}>
          <Image className={styles.newlyadded} src={fifthBg} alt="fifthbg" />
          <div className={styles["cards2"]}>
            {all_packages.map((item) => (
              <div
                key={item.id}
                className={styles["fifth-card"]}
                onClick={() =>
                  handleRedirect(item.id, item.title, item.country_name)
                }
              >
                <Link href="#">
                  <Image
                    className={styles.newlyAddedCardBg}
                    src={item.thumbnail_image}
                    alt={item.title}
                    width={300}
                    height={300}
                  />
                </Link>
                <div className={styles.newlyAddedCardContent}>
                  <div className={styles.newlyAddedTopContent}>
                    <Image
                      className={styles.newlyAddedLogo}
                      src="/img/weyngo_logo_white.png"
                      alt="WeynGo logo"
                      width={65}
                      height={20}
                    />
                    <div className={styles.newlyAddedtripDuration}>
                      <div className={styles.noOfDays}>{item.no_of_days}D</div>
                      <div className={styles.noOfNights}>
                        {item.no_of_nights}N
                      </div>
                    </div>
                  </div>
                  <div className={styles.newlyAddedBottomContent}>
                    <span className={styles.newlyAddedAbout}>
                      {item.title} - <br /> {item.country_name},{item.city_name}
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

export default FifthPage;
