import styles from "./style.module.css";
import Navigation from "./Navigation";
import Image from "next/image";
import { useUserType } from "@/hooks/useUserType";

const FirstPage = ({
  country_name,
  gallery_images,
  banner_image,
  description,
}) => {
  const corporateUser = useUserType();
  return (
    <div className={styles["first-page"]} id={styles["full-screen"]}>
      <Image
        className={styles.CountrypageBg}
        src={banner_image}
        alt="bg"
        width={2000}
        height={800}
      />
      <div className={styles.NavigationCommons}>
        <Navigation />
      </div>

      <div className={styles.content}>
        <div className={styles["thailand-text"]}>
          <h1>{country_name}</h1>
        </div>

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

        <div className={styles["about-thailand"]}>
          <div dangerouslySetInnerHTML={{ __html: description }}></div>
        </div>
        <div className={styles["page-cut"]}></div>
      </div>
    </div>
  );
};

export default FirstPage;
