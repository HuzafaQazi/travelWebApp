import { useRef } from "react";
import { useState, useEffect } from "react";
import Promotion from "@/components/landingpage/promotion/promotion";
import FirstCarousel from "@/components/landingpage/carouselOne/carouselOne";
import SecondCarousel from "@/components/landingpage/carouselTwo/carouselTwo";
import Offers from "@/components/landingpage/offer/offer";
import Holidays from "@/components/landingpage/holidays/holidays";
import Unexplored from "@/components/landingpage/carouselThree/carouselThree";
import Chaticon from "@/components/chaticon/chaticon";
import Footer from "@/components/footer/footer";
import TabTitle from "@/components/tabtitles/tabtitle";
import BookingRequest from "@/components/corporate/booking/hotels/landingPage/BookingRequest";
import BookingRequestSent from "@/components/corporate/booking/hotels/landingPage/BookingRequestSent";
import TravelRequestByEmployees from "@/components/corporate/booking/hotels/landingPage/TravelRequestsByEmployees";
import OfferAndRequest from "@/components/corporate/booking/hotels/landingPage/OffersAndUpdates";
import CorporatePackages from "@/components/corporate/booking/hotels/landingPage/CorporatePackages";
import Schedule from "@/components/corporate/booking/hotels/landingPage/Schedule";
import axios, { getTabSpecificData, handleLogout } from "@/utils/axios/axios";
import { useRouter } from "next/router";
import config from "@/config";
import useLocalStorage from "@/hooks/useLocalStorage";
import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import CommonBanner from "@/components/commonBanner/commonBanner";
import ItineraryBuilder from "@/components/itineraryBuilder/itineraryBuilder";
// import Footer from "@/components/footer/footer";
// import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import { getUserStatus } from "@/utils/userStatus";
import { useLogin } from "@/store/context/LoginContext";
import { useUserType } from "@/hooks/useUserType";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import useSWR from "swr";
import Booking from "@/components/corporate/booking/booking";

const fetcher = async (url) => {
  const response = await axios.get(`${url}`);
  return response.data.data;
};

export default function HomePage({ serverLoading, apiData }) {
  const router = useRouter();
  const corporateUser = useUserType();
  const { setShowLoginButton } = useLogin();
  const isInitialRender = useRef(true); // Track the initial render

  const divStyles = {
    backgroundColor: "#ffffff",
    overflowX: "hidden",
  };

  const [pageLoading, setPageLoading] = useState(false);
  const [getUserID, setUserID] = useLocalStorage("userID");

  const { data: initialData, error } = useSWR(
    `${config.PACKAGE_HOME}`,
    fetcher,
    {
      fallbackData: apiData,
      revalidateOnFocus: false,
    }
  );

  const handlePageLoading = (loading) => {
    setPageLoading(loading);
  };

  const checkUserStatus = async (redirectPath) => {
    const userId = getTabSpecificData("userID");
    if (!userId) return;
    try {
      const response = await getUserStatus(userId);

      if (response.data.status === "inactive") {
        console.log("logout check");
        await handleLogout(redirectPath);
        return;
      }
    } catch (error) {
      console.error("Error checking user status:", error);

      // handleLogout(redirectPath);
    }
  };

  // useEffect(() => {
  //   const path = router.pathname;
  //   const redirectPath = '/?redirect=events';
  //   if (path === '/') {
  //     // Check user status every 5 minutes (300000 ms)
  //     const interval = setInterval(() => checkUserStatus(redirectPath), 300000);

  //     // Initial check
  //     checkUserStatus(redirectPath);

  //     // Cleanup interval on component unmount
  //     return () => clearInterval(interval);
  //   }
  // }, [router.pathname]);
  useEffect(() => {
    if (isInitialRender.current) {
      // Skip the effect on the first render
      isInitialRender.current = false;
      return;
    }

    const path = router.pathname;
    const redirectParam = new URLSearchParams(window.location.search).get(
      "redirect"
    );
    const redirectPath = redirectParam ? `/?redirect=${redirectParam}` : "/";

    if (path === "/") {
      // Check user status every 5 minutes (300000 ms)
      const interval = setInterval(() => checkUserStatus(redirectPath), 300000);

      // Initial check
      checkUserStatus(redirectPath);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }

    // Handle manual redirection
    if (redirectParam && path !== redirectPath) {
      router.replace(redirectPath);
    }
  }, [router.pathname]);

  useEffect(() => {
    if (pageLoading) {
      // Prevent scrolling when pageLoading is true
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [pageLoading]);

  if (error) return <div>Error loading data.</div>;
  if (!initialData) return <div>Loading...</div>;

  return (
    <>
      <TabTitle title={"Home Page"}></TabTitle>
      {corporateUser ? (
        <Booking />
      ) : (
        <div style={divStyles}>
          <GoToTopButton />
          <CommonBanner
            promotions={apiData?.promotions}
            onPageLoading={handlePageLoading}
          />
          {!corporateUser ? (
            <Promotion promotions={apiData?.promotions} />
          ) : (
            <></>
          )}
          {!corporateUser ? (
            <FirstCarousel international_trips={apiData?.international_trips} />
          ) : (
            <></>
          )}
          {!corporateUser ? (
            <SecondCarousel top_destinations={apiData?.top_destinations} />
          ) : (
            <></>
          )}
          {!corporateUser ? (
            <Offers
              gems_of_india={apiData?.gems_of_india}
              luxe_destinations={apiData?.luxe_destinations}
            />
          ) : (
            <></>
          )}
          {!corporateUser ? (
            <Holidays
              holidays_by_theme={apiData?.holidays_by_theme}
              group_tours={apiData?.group_tours}
            />
          ) : (
            <></>
          )}
          {!corporateUser ? (
            <Unexplored
              explore_the_unexplored={apiData?.explore_the_unexplored}
            />
          ) : (
            <></>
          )}
          {corporateUser ? (
            <div className="bg-white pt-5 pb-3 px-4 gap-3">
              <BookingRequest />
              <BookingRequestSent />
              <TravelRequestByEmployees />
              <OfferAndRequest />
              <CorporatePackages />
              <Schedule />
            </div>
          ) : (
            <></>
          )}
          <Chaticon />
          <ItineraryBuilder />
          {!corporateUser ? <Footer /> : <Footer1 />}
        </div>
      )}
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
