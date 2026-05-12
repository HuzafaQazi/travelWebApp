// import React, { useRef, useCallback } from "react";
// import { useState, useEffect, useMemo } from "react";
// import dynamic from "next/dynamic"; // For dynamic imports
// import { useRouter } from "next/router";
// import axios, { handleLogout, getTabSpecificData } from "@/utils/axios/axios";
// import config from "@/config";
// import useLocalStorage from "@/hooks/useLocalStorage";
// import useSWR from "swr";
// import { getUserStatus } from "@/utils/userStatus";
// import { useUserType } from "@/hooks/useUserType";
// import SkeletonLoader from "@/components/loader/SkeletonLoader";
// import { LazyLoadComponent } from "react-lazy-load-image-component";
// import CommonBanner from "@/components/commonBanner/commonBanner";
// import CorporatePage from "@/pages/corporate/auth/booking/index";

// // Dynamically import non-critical components
// const Banner = dynamic(() => import("@/components/landingpage/banner/banner"));
// const Promotion = dynamic(() =>
//   import("@/components/landingpage/promotion/promotion")
// );
// const FirstCarousel = dynamic(() =>
//   import("@/components/landingpage/carouselOne/carouselOne")
// );
// const SecondCarousel = dynamic(() =>
//   import("@/components/landingpage/carouselTwo/carouselTwo")
// );
// const Offers = dynamic(() => import("@/components/landingpage/offer/offer"));
// const Holidays = dynamic(() =>
//   import("@/components/landingpage/holidays/holidays")
// );
// const Unexplored = dynamic(() =>
//   import("@/components/landingpage/carouselThree/carouselThree")
// );

// const Footer1 = dynamic(() =>
//   import("@/components/corporate/footerCorporate/footerCorporate")
// );
// const ItineraryBuilder = dynamic(
//   () => import("@/components/itineraryBuilder/itineraryBuilder"),
//   { ssr: false }
// );

// const GoToTopButton = dynamic(
//   () => import("@/components/gototopbutton/gototopbutton"),
//   { ssr: false }
// );
// const Chaticon = dynamic(() => import("@/components/chaticon/chaticon"), {
//   ssr: false,
// });
// const Footer = dynamic(() => import("@/components/footer/footer"), {
//   ssr: false,
// });
// const TabTitle = dynamic(() => import("@/components/tabtitles/tabtitle"), {
//   ssr: false,
// });

// // const CommonBanner = lazy(() =>
// //   import("@/components/commonBanner/commonBanner")
// // );

// const fetcher = async (url) => {
//   const response = await axios.get(`${url}`);
//   return response.data.data;
// };

// const MemoizedFooter = React.memo(Footer);
// const MemoizedFooter1 = React.memo(Footer1);

// export default function HomePage({ serverLoading, apiData }) {
//   const router = useRouter();
//   const corporateUser = useUserType();
//   const isInitialRender = useRef(true); // Track the initial render
//   const [pageLoading, setPageLoading] = useState(false);
//   const [getUserID] = useLocalStorage("userID");

//   // SWR for fetching data efficiently
//   // const { data: initialData, error } = useSWR(
//   //   `${config.PACKAGE_HOME}`,
//   //   fetcher,
//   //   {
//   //     fallbackData: apiData,
//   //     revalidateOnFocus: false,
//   //     dedupingInterval: 60000, // 1 minute
//   //   }
//   // );

//   // Memoizing the style object
//   const divStyles = useMemo(
//     () => ({
//       backgroundColor: "#ffffff",
//       overflowX: "hidden",
//     }),
//     []
//   );

//   // Function to handle page loading
//   const handlePageLoading = useCallback((loading) => {
//     setPageLoading(loading);
//   }, []);

//   // Check user status and handle logout if necessary
//   const checkUserStatus = useCallback(
//     async (redirectPath) => {
//       const userId = getTabSpecificData("userID")?.replace(/"/g, "");
//       if (!userId) return;
//       try {
//         const response = await getUserStatus(userId);

//         if (response.data.status === "inactive") {
//           console.log("logout check");
//           await handleLogout(redirectPath);
//           return;
//         }
//       } catch (error) {
//         console.error("Error checking user status:", error);
//       }
//     },
//     []
//   );

//   // UseEffect to handle user status check on route change
//   useEffect(() => {
//     if (isInitialRender.current) {
//       isInitialRender.current = false;
//       return;
//     }

//     const path = router.pathname;
//     const redirectParam = new URLSearchParams(window.location.search).get(
//       "redirect"
//     );
//     const redirectPath = redirectParam ? `/?redirect=${redirectParam}` : "/";

//     if (path === "/") {
//       const interval = setInterval(() => checkUserStatus(redirectPath), 300000);
//       checkUserStatus(redirectPath);

//       return () => clearInterval(interval);
//     }

//     if (redirectParam && path !== redirectPath) {
//       router.replace(redirectPath);
//     }
//   }, [router.pathname, checkUserStatus]);

//   // Prevent scrolling when page is loading
//   useEffect(() => {
//     document.body.style.overflow = pageLoading ? "hidden" : "auto";
//   }, [pageLoading]);

//   // if (error) return <div>Error loading data.</div>;
//   // if (!initialData) return <div>Loading...</div>;

//   return (
//     <>
//       <TabTitle title={"Home Page"} />
//       {!corporateUser ? (
//         <div style={divStyles}>
//           <GoToTopButton />

//           <LazyLoadComponent placeholder={<SkeletonLoader width={2000} />}>
//             <CommonBanner
//               promotions={apiData?.promotions}
//               onPageLoading={handlePageLoading}
//             />
//           </LazyLoadComponent>
//           <Promotion promotions={apiData?.promotions} />
//           <FirstCarousel international_trips={apiData?.international_trips} />
//           <SecondCarousel top_destinations={apiData?.top_destinations} />
//           <Offers
//             gems_of_india={apiData?.gems_of_india}
//             luxe_destinations={apiData?.luxe_destinations}
//           />
//           <Holidays
//             holidays_by_theme={apiData?.holidays_by_theme}
//             group_tours={apiData?.group_tours}
//           />
//           <Unexplored
//             explore_the_unexplored={apiData?.explore_the_unexplored}
//           />
//           <Chaticon />
//           <ItineraryBuilder />
//           <MemoizedFooter />
//         </div>
//       ) : (
//         <CorporatePage />
//       )}
//     </>
//   );
// }

// export async function getStaticProps(context) {
//   const payload = {
//     promotions: [],
//     international_trips: [],
//     top_destinations: [],
//     gems_of_india: [],
//     luxe_destinations: [],
//     holidays_by_theme: [],
//     group_tours: [],
//     explore_the_unexplored: [],
//   };

//   try {
//     const response = await axios.get(`${config.PACKAGE_HOME}`);

//     const data = response.data?.data;
//     if (!data) {
//       return {
//         props: {
//           serverLoading: false,
//           apiData: payload,
//         },
//         revalidate: 60, // Re-generate the page every 60 seconds
//       };
//     }

//     return {
//       props: {
//         serverLoading: false,
//         apiData: data,
//       },
//       revalidate: 60, // Re-generate the page every 60 seconds
//     };
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return {
//       props: {
//         serverLoading: false,
//         apiData: payload,
//       },
//       revalidate: 60, // Re-generate the page every 60 seconds
//     };
//   }
// }

import React, { useRef, useCallback } from "react";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic"; // For dynamic imports
import { useRouter } from "next/router";
import axios from "@/utils/axios/axios";
import config from "@/config";
import { useUserType } from "@/hooks/useUserType";
import SkeletonLoader from "@/components/loader/SkeletonLoader";
import { LazyLoadComponent } from "react-lazy-load-image-component";
import CommonBanner from "@/components/b2c/common/commonbanner/commonbanner";
import CorporatePage from "@/pages/corporate/auth/booking/index";

// Dynamically import non-critical components
const Banner = dynamic(() => import("@/components/landingpage/banner/banner"));
const Promotion = dynamic(() =>
  import("@/components/landingpage/promotion/promotion")
);
const FirstCarousel = dynamic(() =>
  import("@/components/landingpage/carouselOne/carouselOne")
);
const SecondCarousel = dynamic(() =>
  import("@/components/landingpage/carouselTwo/carouselTwo")
);
const Offers = dynamic(() => import("@/components/landingpage/offer/offer"));
const Holidays = dynamic(() =>
  import("@/components/landingpage/holidays/holidays")
);
const Unexplored = dynamic(() =>
  import("@/components/landingpage/carouselThree/carouselThree")
);

const Footer1 = dynamic(() =>
  import("@/components/corporate/footerCorporate/footerCorporate")
);
const ItineraryBuilder = dynamic(
  () => import("@/components/itineraryBuilder/itineraryBuilder"),
  { ssr: false }
);

const GoToTopButton = dynamic(
  () => import("@/components/gototopbutton/gototopbutton"),
  { ssr: false }
);
const Chaticon = dynamic(() => import("@/components/chaticon/chaticon"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/footer/footer"), {
  ssr: false,
});
const TabTitle = dynamic(() => import("@/components/tabtitles/tabtitle"), {
  ssr: false,
});

const MemoizedFooter = React.memo(Footer);

export default function HomePage({ serverLoading, apiData }) {
  const router = useRouter();
  const corporateUser = useUserType();
  const isInitialRender = useRef(true); // Track the initial render
  const [pageLoading, setPageLoading] = useState(false);
  const divStyles = useMemo(
    () => ({
      backgroundColor: "#ffffff",
      overflowX: "hidden",
    }),
    []
  );

  const handlePageLoading = useCallback((loading) => {
    setPageLoading(loading);
  }, []);

  // UseEffect to handle user status check on route change
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const path = router.pathname;
    const redirectParam = new URLSearchParams(window.location.search).get(
      "redirect"
    );
    const redirectPath = redirectParam ? `/?redirect=${redirectParam}` : "/";

    if (redirectParam && path !== redirectPath) {
      router.replace(redirectPath);
    }
  }, [router.pathname]);

  useEffect(() => {
    document.body.style.overflow = pageLoading ? "hidden" : "auto";
  }, [pageLoading]);

  return (
    <>
      <TabTitle title={"Home Page"} />
      {!corporateUser ? (
        <div style={divStyles}>
          <GoToTopButton />

          <LazyLoadComponent placeholder={<SkeletonLoader width={2000} />}>
            <CommonBanner
              promotions={apiData?.promotions}
              onPageLoading={handlePageLoading}
            />
          </LazyLoadComponent>
          {/* <Promotion promotions={apiData?.promotions} />  */}
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
          <Unexplored
            explore_the_unexplored={apiData?.explore_the_unexplored}
          />
          <Chaticon />
          <ItineraryBuilder />
          <MemoizedFooter />
        </div>
      ) : (
        <CorporatePage />
      )}
    </>
  );
}

export async function getStaticProps(context) {
  const payload = {
    // promotions: [],
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
      return {
        props: {
          serverLoading: false,
          apiData: payload,
        },
        revalidate: 60, // Re-generate the page every 60 seconds
      };
    }

    return {
      props: {
        serverLoading: false,
        apiData: data,
      },
      revalidate: 60, // Re-generate the page every 60 seconds
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        serverLoading: false,
        apiData: payload,
      },
      revalidate: 60, // Re-generate the page every 60 seconds
    };
  }
}
