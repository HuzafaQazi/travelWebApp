import Head from "next/head";
import FirstPage from "@/components/travelguide/FirstPage";
import SecondPage from "@/components/travelguide/SecondPage";
import ThirdPage from "@/components/travelguide/ThirdPage";
import FourthPage from "@/components/travelguide/FourthPage";
import Footer from "@/components/footer/footer";
import FAQSection from "@/components/packages/FAQ";
import axios from '@/utils/axios/axios';
import config from "@/config";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import { useUserType } from "@/hooks/useUserType";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
;

export default function Home({ serverLoading, apiData }) {
  const fetchedData = apiData[0];
  const corporateUser = useUserType();

  const fetchedDataProps = {
    title: fetchedData?.title,
    description: fetchedData?.description,
    thumbnail_image: fetchedData?.thumbnail_image,
    banner_image: fetchedData?.banner_image,
    gallery_images: fetchedData?.gallery_images,
    cityname: fetchedData?.cityname,
    countryname: fetchedData?.countryname,
    seo_meta_title: fetchedData?.seo_meta_title,
    seo_meta_description: fetchedData?.seo_meta_description,
    seo_meta_keywords: fetchedData?.seo_meta_keywords,
    seo_meta_robots: fetchedData?.seo_meta_robots,
  };

  return (
    <div>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          {fetchedDataProps.seo_meta_title
            ? fetchedDataProps.seo_meta_title
            : "Travel Guides page"}
        </title>
        {fetchedDataProps.seo_meta_description && (
          <meta
            name="description"
            content={fetchedDataProps.seo_meta_description}
          />
        )}
        {fetchedDataProps.seo_meta_robots && (
          <meta name="robots" content={fetchedDataProps.seo_meta_robots} />
        )}
        {fetchedDataProps.seo_meta_keywords && (
          <meta name="keywords" content={fetchedDataProps.seo_meta_keywords} />
        )}
      </Head>
      {!corporateUser ? (
        <div style={{ background: '#002a30e5' }}>
          {/* <HeaderCommon /> */}
          <B2CHeader/>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff" }}>
          <Header />
        </div>
      )}
      <FirstPage title={fetchedData?.title}
      />
      <SecondPage
        countryname={fetchedData?.countryname}
        description={fetchedData?.description}
        gallery_images={fetchedData?.gallery_images}
        top_seller_packages={fetchedData?.top_seller_packages}
      />
      <ThirdPage
        must_visit_packages={fetchedData?.must_visit_packages}
        travel_articles={fetchedData?.travel_articles}
        countryname={fetchedData?.countryname}
        package_payment_flag={false}
        form_offer_contents={fetchedData?.form_offer_contents}
      />
      <FourthPage
        trending_packages={fetchedData?.trending_packages}
        countryname={fetchedData?.countryname}
      />
      {/* <FifthPage /> */}
      <FAQSection faqs={fetchedData?.travel_faq} />
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
    const guideId = context.params.param[0];
    const response = await axios.get(
      `${config.PACKAGE_TRAVEL_GUIDE}/${guideId}`
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
