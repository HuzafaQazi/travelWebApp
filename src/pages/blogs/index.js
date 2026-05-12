import styles from "./styles.module.css";
import { useRef, useState } from "react";
import Head from "next/head";
import Footer from "@/components/footer/footer";
import axios from '@/utils/axios/axios';
import config from "@/config";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import Loader from "@/components/loader/loader";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../utils/firebase";
import { redirectBlogDetail } from "../../../utils/pageredirection";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import qugoLogo from "../../../public/img/Qugo Logo mobile.png";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
;

export default function Home({ serverLoading, apiData }) {
  const router = useRouter();
  const corporateUser = useUserType();

  const [loading, setLoading] = useState(false);

  const handleRedirect = async (country_name, cityname, slug) => {
    setLoading(true);
    const url = redirectBlogDetail(country_name, cityname, slug);
    window.open(url, '_blank');
    // await router.push(url);
    logEvent(analytics, "blog_details", {
      country_name,
      cityname,
      slug,
    });
    setLoading(false);
  };

  const carouselTrackRef = useRef(null);
  const handleCarouselScroll = (direction) => {
    const scrollAmount = 300; // Adjust the scroll amount as needed

    if (carouselTrackRef.current) {
      const currentScrollLeft = carouselTrackRef.current.scrollLeft;

      if (direction === "prev") {
        // Scroll to the left
        carouselTrackRef.current.scrollLeft = currentScrollLeft - scrollAmount;
      } else if (direction === "next") {
        // Scroll to the right
        carouselTrackRef.current.scrollLeft = currentScrollLeft + scrollAmount;
      }
    }
  };

  return (
    <div>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Blogs</title>
      </Head>
      {!corporateUser ? (
        <div
          style={{
            backgroundColor: "#002a30e5",
            position: "unset",
            height: "60px",
          }}
        >
          {/* <HeaderCommon isAuthRequired={false} /> */}
          <B2CHeader isAuthRequired={false}/>
          {/* <HeaderCommon isAuthRequired={true} /> */}
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff" }}>
          <Header />
        </div>
      )}

      {loading && <Loader />}

      {apiData.map((blog, index) => (
        <div key={index} className={styles["fourth-page"]}>
          <div className={styles["trending-heading"]}>
            <h2>{blog.country_name}</h2>
            <div className={styles["horizontal"]}></div>
          </div>
          <div className={styles["white-back"]}>
            {/* first carousel */}
            <div className={styles.relatedcarousel}>
              <div
                className={styles.relatedcarouselTrack}
                ref={carouselTrackRef}
              >
                {blog.blogs.map((blog1) => (
                  <div
                    className={styles.trendingcard}
                    key={blog1.id}
                    onClick={() =>
                      handleRedirect(
                        blog1.country_name,
                        blog1.city_name,
                        blog1.slug
                      )
                    }
                  >
                    <Image
                      className={styles.trendingcardBg}
                      src={blog1.banner_image}
                      alt={blog1.title}
                      height={700}
                      width={600}
                    />
                    <div className={styles.thailandContent}>
                      <div className={styles.topContent}>
                        <div className={styles.logo}>
                          <Image
                            className={styles.qugoLogo}
                            src={qugoLogo}
                            alt="logo"
                          />
                        </div>
                      </div>
                      <h2 className={styles.citynameHeading}>{blog1.city_name}</h2>
                      <div className={styles.bottomContent}>
                        <h2 className={styles.cardheading}>{blog1.title}</h2>
                      </div>
                      {/* <div className={styles.bookButton}>
                          <button className={styles.bookbtn}>{blog1.city_name}</button>
                        </div> */}
                    </div>
                  </div>
                ))}
              </div>
              <button
                className={styles.carouselControl}
                data-direction="prev"
                onClick={() => handleCarouselScroll("prev")}
              >
                <FontAwesomeIcon icon={faAngleDoubleLeft} />
              </button>
              <button
                className={styles.carouselControl}
                data-direction="next"
                onClick={() => handleCarouselScroll("next")}
              >
                <FontAwesomeIcon icon={faAngleDoubleRight} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {!corporateUser ? (
        <Footer />
      ) : (
        <Footer1 />
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    // const url = `http://localhost:3030/qtravels/searchService/api/v1.0/blog/getblogs`;
    // const response = await axios.get(`${url}`);
    const response = await axios.get(`${config.BLOG_HOME}`);

    const data = response.data?.data;

    console.log(data);

    if (!data) {
      return {
        notFound: true, // Show "Not Found" page
      };
    }

    return {
      props: {
        serverLoading: false,
        apiData: data,
      },
    };
  } catch (error) {
    console.log(error);
    console.error("Error fetching data:", error);
    return {
      notFound: true, // Show "Not Found" page on error
    };
  }
}
