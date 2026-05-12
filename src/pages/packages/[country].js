// pages/index.js
import Head from "next/head";
import FirstPage from "@/components/packages/FirstPage";
import SecondPage from "@/components/packages/SecondPage";
import ThirdPage from "@/components/packages/ThirdPage";
import FourthPage from "@/components/packages/FourthPage";
import FifthPage from "@/components/packages/FifthPage";
import SixthPage from "@/components/packages/SixthPage";
import SeventhPage from "@/components/packages/SeventhPage";
import FAQSection from "@/components/packages/FAQ";
import Footer from "@/components/footer/footer";
import axios from '@/utils/axios/axios';
import config from "@/config";
import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import Chaticon from "@/components/chaticon/chaticon";
import HeaderCommon from "../../components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import styles from "@/pages/packages/PackageDetail.module.css";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
;
// Import other components as needed

const Home = ({ serverLoading, apiData }) => {
  const fetchedData = apiData[0];
  const corporateUser = useUserType();

  return (
    <div>
      <Head>
        <title>Country Packages</title>
        <meta name="description" content="Your Next.js website description" />
      </Head>
      <GoToTopButton />
      <Chaticon />
      {!corporateUser ? (
        <div style={{ backgroundColor: "#002a30e5" }} >
          {/* <HeaderCommon className={styles.headerCommons} /> */}
            <B2CHeader className={styles.headerCommons} />
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", height: "11vh" }}>
          <Header />
        </div>
      )}
      <FirstPage
        country_name={fetchedData?.country_name}
        gallery_images={fetchedData?.country_gallery_images}
        banner_image={fetchedData?.country_banner_image}
        description={fetchedData?.country_description}
      />
      <SecondPage popular_packages={fetchedData?.popular_packages} />
      <ThirdPage
        country_name={fetchedData?.country_name}
        tour_packages={fetchedData?.tour_packages}
      />
      <FourthPage top_selling_packages={fetchedData?.top_selling_packages} />
      <FifthPage
        country_name={fetchedData?.country_name}
        all_packages={fetchedData?.all_packages}
      />
      <SixthPage
        country_name={fetchedData?.country_name}
        travel_guides={fetchedData?.travel_guides}
      />
      <SeventhPage testimonials={fetchedData?.testimonials} />
      <FAQSection faqs={fetchedData?.faqs} />
      {!corporateUser ? (
        <Footer />
      ) : (
        <Footer1 />
      )}
    </div>
  );
};

export default Home;

export async function getServerSideProps(context) {
  try {
    const countryId = context.params.country;
    const response = await axios.get(
      `${config.PACKAGE_BY_COUNTRIES}/${countryId}`
    );

    const data = response.data?.data;

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
