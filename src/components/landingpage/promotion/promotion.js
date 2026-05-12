import styles from "./styles.module.css";
import { useState } from "react";
import { useRouter } from "next/router";
import { redirectPackageDetail } from "../../../../utils/pageredirection";
import Loader from "@/components/loader/loader";
import SkeletonLoader from "@/components/loader/SkeletonLoader";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../../utils/firebase";

export default function Promotion({ promotions }) {
  const router = useRouter();

  const [expandedPromotions, setExpandedPromotions] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRedirect = (id, title, country_name) => {
    setLoading(true);
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
    logEvent(analytics, "package_redirect", {
      country_name: country_name,
      title: title,
    });
  };

  return (
    <>
      {promotions?.length > 0 && (
        <div className={styles.promotionCards}>
          <h2 className={styles.promotionHeading}>Promotions for you</h2>
          <div className={styles.headingUnderline}></div>

          {loading && <Loader />}

          <div className={styles.promotionCardContainer}>
            {promotions.map((promotion) => {
              const description = showFullDescription
                ? promotion.description
                : promotion.description.slice(0, 200);
              const descriptionWithoutTags = description.replace(
                /(<([^>]+)>)/gi,
                ""
              );

              return (
                <div
                  key={promotion.id}
                  className={styles.promotionCard}
                  onClick={() =>
                    handleRedirect(
                      promotion.id,
                      promotion.title,
                      promotion.country_name
                    )
                  }
                >
                  <LazyLoadComponent
                    placeholder={<SkeletonLoader width={500} />}
                  >
                    <video
                      className={styles.promoCardBg}
                      playsInline
                      autoPlay
                      loop
                      muted
                    >
                      <source src={promotion.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </LazyLoadComponent>
                  {/* </Suspense> */}
                  <div className={styles.textOverlay}>
                    <h6 className={styles.overlayHeading}>
                      {promotion.country_name}
                    </h6>
                    <div className={styles.overlayDescription}>
                      <div className={styles.titleContainer}>
                        {promotion.title}
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
