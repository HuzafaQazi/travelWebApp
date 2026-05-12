import Banner from "@/components/packages/banner";
import Promotion from "@/components/landingpage/promotion/promotion";
import FirstCarousel from "@/components/landingpage/carouselOne/carouselOne";
import SecondCarousel from "@/components/landingpage/carouselTwo/carouselTwo";
import Offers from "@/components/landingpage/offer/offer";
import Holidays from "@/components/landingpage/holidays/holidays";
import Unexplored from "@/components/landingpage/carouselThree/carouselThree";
import Chaticon from "@/components/chaticon/chaticon";
import Footer from "@/components/footer/footer";

import axios from '@/utils/axios/axios';
import config from "@/config";
import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import ItineraryBuilder from "@/components/itineraryBuilder/itineraryBuilder";

export default function HomePage({ serverLoading, apiData }) {
  const divStyles = {
    backgroundColor: "#ffffff",
  };

  return (
    <>
      <div style={divStyles}>
        <GoToTopButton/>
        <Banner promotions={apiData?.promotions} />
        <Promotion promotions={apiData?.promotions} />
        <FirstCarousel international_trips={apiData?.international_trips} />
        <SecondCarousel top_destinations={apiData?.top_destinations} />
        <Offers
          gems_of_india={apiData?.gems_of_india}
          luxe_destinations={apiData?.luxe_destinations}
        />
        <Holidays
          holidays_by_theme={apiData?.holidays_by_theme}
          group_tours={apiData?.group_tours}
        />
        <Unexplored explore_the_unexplored={apiData?.explore_the_unexplored} />
        <Chaticon />
        <ItineraryBuilder/>
        <Footer />
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const payload = {
    promotions: [],
    international_trips: [],
    top_destinations: [],
    gems_of_india: [],
    luxe_destinations: [],
    holidays_by_theme: [],
    group_tours: [],
    explore_the_unexplored: [],
  };

  try {
    const response = await axios.get(`${config.PACKAGE_HOME}`);

    const data = response.data?.data;

    if (!data) {
      // return {
      //   notFound: true, // Show "Not Found" page
      // };
      return {
        props: {
          serverLoading: false,
          apiData: payload,
        },
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
      props: {
        serverLoading: false,
        apiData: payload,
      },
    };
  }
}
