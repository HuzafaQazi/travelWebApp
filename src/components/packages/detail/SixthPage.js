import styles from "./style.module.css";
import Image from "next/image";
import Link from "next/link";
import Loader from "@/components/loader/loader";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { redirectPackageDetail } from "../../../../utils/pageredirection";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";

const SixthPage = ({
  top_attraction_packages,
  showTopAttraction,
  countryname,
}) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRouteChange = () => {
      setLoading(false);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, "top_attractions", {
      id: id,
      title: title,
      countryname: country_name,
    });
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    showTopAttraction && (
      <div className={styles["sixth-page"]}>
        <center>
          <h2 className={styles["head-style"]}>
            {countryname} Top Attractions
          </h2>
        </center>
        <center>
          <hr />
        </center>

        {loading && <Loader />}

        <div className={styles["top-cards"]}>
          {top_attraction_packages.map((attraction) => {
            const description = attraction.description.slice(0, 200);
            const descriptionWithoutTags = description.replace(
              /(<([^>]+)>)/gi,
              ""
            );
            return (
              <div class={styles["card"]} key={attraction.id}>
                <div class={styles["card-left"]}>
                  <div class={styles["image-container"]}>
                    <Link
                      href={redirectPackageDetail(
                        attraction.id,
                        attraction.title,
                        attraction.country_name
                      )}
                    >
                      <Image
                        className={styles.topAttractionCardBg}
                        src={attraction.thumbnail_image}
                        alt={attraction.title}
                        width={300}
                        height={200}
                      />
                    </Link>
                  </div>
                </div>
                <div class={styles["card-right"]}>
                  <div className={styles.topAttractionRightFlex}>
                    <div className={styles.cardRightHead}>
                      {attraction.title}
                    </div>
                    <div
                      className={styles["up-p"]}
                      dangerouslySetInnerHTML={{
                        __html: descriptionWithoutTags,
                      }}
                    ></div>
                    {attraction.description.length > 200 && (
                      <Link
                        href={redirectPackageDetail(
                          attraction.id,
                          attraction.title,
                          attraction.country_name
                        )}
                        className={styles.readMore}
                      >
                        Read More
                      </Link>
                    )}
                  </div>
                  <div class={styles["price-container"]}>
                    <span class={styles["price"]}>
                      INR{" "}
                      {attraction.offer_price
                        ? formatPrice(attraction.offer_price)
                        : formatPrice(attraction.price)}
                    </span>
                    <button
                      class={styles["book-button"]}
                      onClick={() =>
                        handleRedirect(
                          attraction.id,
                          attraction.title,
                          attraction.country_name
                        )
                      }
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )
  );
};

export default SixthPage;
