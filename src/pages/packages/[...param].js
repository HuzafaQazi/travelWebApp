import React from "react";
import Head from "next/head";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import FirstPage from "@/components/packages/detail/FirstPage";
import PackageInclusion from "@/components/packages/detail/PackageInclusion";
import AdditionalInfo from "@/components/packages/detail/AdditionalInfo";
import FourthPage from "@/components/packages/detail/FourthPage";
import FifthPage from "@/components/packages/detail/FifthPage";
import SixthPage from "@/components/packages/detail/SixthPage";
import Footer from "@/components/footer/footer";
import styles from "@/pages/packages/PackageDetail.module.css";
import { useLogin } from "@/store/context/LoginContext";
import axios from "@/utils/axios/axios";
import config from "@/config";
import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import Chaticon from "@/components/chaticon/chaticon";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import dynamic from "next/dynamic";

const NoSSRSecondPage = dynamic(
  () => import("@/components/packages/detail/SecondPage"),
  { ssr: false }
);

export default function Home({ serverLoading, apiData }) {
  const { isOpen } = useLogin();
  const corporateUser = useUserType();

  const itineraryRef = React.useRef(null);
  const reviewsRef = React.useRef(null);
  const policyRef = React.useRef(null);

  const [activeButton, setActiveButton] = React.useState("itinerary");


  const handleClick = (button) => {
    setActiveButton(button);

    // Scroll to the corresponding section when the button is clicked
    if (button === "itinerary" && itineraryRef.current) {
      itineraryRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (button === "reviews" && reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (button === "policy" && policyRef.current) {
      policyRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Function to handle scrolling and update the active tab
  const handleScroll = React.useCallback(() => {
    const itinerarySection = itineraryRef.current;
    const reviewsSection = reviewsRef.current;
    const policySection = policyRef.current;

    if (itinerarySection && policySection) {
      const scrollY = window.scrollY;

      if (
        scrollY >= itinerarySection.offsetTop &&
        scrollY < policySection.offsetTop
      ) {
        setActiveButton("itinerary");
      } else if (scrollY >= policySection.offsetTop) {
        setActiveButton("policy");
      }
    }
  }, [itineraryRef, policyRef]);

  // Add a scroll event listener to update the active tab on scroll
  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const detail = apiData?.[0];

  if (!detail) {
    return <div>No package details available.</div>;
  }

  const detailProps = {
    id: detail?.id,
    title: detail?.title,
    ratings: detail?.ratings,
    reviews_count: detail?.reviews_count,
    price: detail?.price,
    offer_price: detail?.offer_price,
    offer_percentage: detail?.offer_percentage,
    no_of_days: detail?.no_of_days,
    no_of_nights: detail?.no_of_nights,
    highlights: detail?.highlights,
    overview: detail?.overview,
    thumbnail_image: detail?.thumbnail_image,
    banner_image: detail?.banner_image,
    gallery_images: detail?.gallery_images,
    cityname: detail?.cityname,
    countryname: detail?.countryname,
    package_payment_flag: detail?.package_payment_flag,
    seo_meta_title: detail?.seo_meta_title,
    seo_meta_description: detail?.seo_meta_description,
    seo_meta_keywords: detail?.seo_meta_keywords,
    seo_meta_robots: detail?.seo_meta_robots,
    seo_header1: detail?.seo_header1,
    seo_header2: detail?.seo_header2,
  };

  return (
    <div
      className={`${styles.blurContainer} ${
        isOpen ? styles.blurBackground : ""
      }`}
    >
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          {detailProps?.seo_meta_title
            ? detailProps?.seo_meta_title
            : detailProps?.countryname}
        </title>
        {detailProps?.seo_meta_description && (
          <meta
            name="description"
            content={detailProps?.seo_meta_description}
          />
        )}
        {detailProps?.seo_meta_robots && (
          <meta name="robots" content={detailProps?.seo_meta_robots} />
        )}
        {detailProps?.seo_meta_keywords && (
          <meta name="keywords" content={detailProps?.seo_meta_keywords} />
        )}
      </Head>

      {/* Hidden H1 and H2 for SEO */}
      <div style={{ display: "none" }}>
        {detailProps?.seo_header1 && <h1>{detailProps?.seo_header1}</h1>}
        {detailProps?.seo_header2 && <h2>{detailProps?.seo_header2}</h2>}
      </div>

      {!corporateUser ? (
        <div className={styles.headerCommons}>
          {/* <HeaderCommon 
          /> */}
          <B2CHeader/>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff" }}>
          <Header />
        </div>
      )}

      <GoToTopButton />
      <FirstPage
        handleClick={handleClick}

        {...detailProps}
      />
      <NoSSRSecondPage
        activeButton={activeButton}
        handleClick={handleClick}
        itineraryRef={itineraryRef}
        {...detailProps}
        package_itineraries={detail?.package_itinerary || []}
        showPolicy={detail?.package_policy?.length > 0}
        showItinerary={detail?.package_itinerary?.length > 0}
        form_offer_contents={detail?.form_offer_contents || {}}
      />
      {/* <ThirdPage reviewsRef={reviewsRef} /> */}
      <PackageInclusion
        inclusions={detail?.inclusions || []}
        exclusions={detail?.exclusions || []}
      />
      <AdditionalInfo additional_information={detail?.additional_information} />
      <FourthPage related_packages={detail?.related_packages} />
      <FifthPage
        policyRef={policyRef}
        package_policy={detail?.package_policy}
      />
      <SixthPage
        top_attraction_packages={detail?.top_attraction_packages}
        showTopAttraction={detail?.top_attraction_packages?.length > 0}
        countryname={detailProps?.countryname}
      />
      <Chaticon />
      {!corporateUser ? <Footer /> : <Footer1 />}
    </div>
  );
}

export async function getServerSideProps(context) {
  const payload = {
    id: "",
    title: "",
    ratings: "",
    reviews_count: "",
    price: "",
    offer_price: "",
    no_of_days: "",
    no_of_nights: "",
    highlights: "",
    overview: "",
    thumbnail_image: "",
    banner_image: "",
    gallery_images: [],
    cityname: "",
    countryname: "",
    seo_meta_title: "",
    seo_meta_description: "",
    seo_meta_keywords: "",
    seo_meta_robots: "",
    seo_header1: "",
    seo_header2: "",
    package_itinerary: [],
    package_policy: [],
    form_offer_contents: {},
    related_packages: [],
    top_attraction_packages: [],
  };
  try {
    // Now packageId being changed from id to slug
    const packageId = context.params.param?.[context.params.param.length - 1];
    const countrySlug = context.params.param[0];
    const response = await axios.get(
      `${config.PACKAGE_DETAIL}/${packageId}/${countrySlug}`
    );

    const data = response.data?.data;

    if (!data || !(data.length > 0)) {
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
