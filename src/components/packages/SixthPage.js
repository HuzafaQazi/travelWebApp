import { useState } from "react";
import styles from "./style.module.css";
import Image from "next/image";
import Link from "next/link";
import Loader from "@/components/loader/loader";
import { useRouter } from "next/router";
import { redirectTravelGuidePage } from "../../../utils/pageredirection";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";

const SixthPage = ({ country_name, travel_guides }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleRedirect = (id, title) => {
    setLoading(true);
    const url = redirectTravelGuidePage(id, title);
    router.push(url);
    logEvent(analytics, "travel_guides_redirect", {
      title: title,
    });
  };

  return (
    <>
      {loading && <Loader />}

      <div className={styles["sixth-page"]}>
        <div className={styles["sixth-head"]}>
          <center>
            <h2>{country_name} Travel Guides</h2>
          </center>
          <center>
            <hr />
          </center>
        </div>
        <div className={styles["sixth-container"]}>
          {travel_guides.map((guide, index) => (
            <div
              key={guide.id}
              className={styles.guide}
              onClick={() => handleRedirect(guide.id, guide.title)}
            >
              <Link href="#">
                <Image
                  className={styles.guideImagebg}
                  src={guide.thumbnail_image}
                  alt={guide.title}
                  width={400}
                  height={600}
                />
              </Link>
              <div className={styles.guideBgContent}>
                <div className={styles.guideNum}>0{index + 1}</div>
                <div className={styles.guideTitle}>{guide.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SixthPage;
