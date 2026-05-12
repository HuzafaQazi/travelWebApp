import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import HeaderCommon from "@/components/HeaderCommon/HeaderCommon";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import Header from "@/components/corporate/auth/Header";
import bigbg from "../../../../../public/img/landingPageBg.png";
import bannerBg from "../../../../../public/img/corpBgBanner.png";
import feature1 from "../../../../../public/img/feature1.png";
import feature2 from "../../../../../public/img/feature2.png";
import feature3 from "../../../../../public/img/feature3.png";
import feature4 from "../../../../../public/img/feature4.png";
import mobbg from "../../../../../public/img/mobBG.png";
import Link from "next/link";
import Loader from "@/components/loader/loader";
import { useLogin } from "@/store/context/LoginContext";
import FlightBanner from "../../../../components/b2c/flights/flightBanner/FlightBanner";
import FlightNavigation from "../../flights/flightNavigation/FlightNavigation";
import HotelBanner from "../../../landingpage/banner/banner";
import HotelNavigation from "@/components/b2c/hotels/hotelbanner/HotelNavigation";
import PackageBanner from "../../../packages/banner";
import FlightLoader from "../../../loader/FlightLoader";
import HotelLoader from "../../../loader/HotelLoader";
import PackageLoader from "../../../loader/PackageLoader";
import Carousel from "../../../PartnersCarousal/partnersCarousal";
import { useRouter } from "next/router";
import { redirectPackageDetail } from "../../../../../utils/pageredirection";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useUserType } from "@/hooks/useUserType";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlane,
  faBed,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import hotel from "../../../../images/corporate/Group 14481.png";
import hotel1 from "../../../../images/corporate/Group 14481 (1).png";

export default function CommonBanner({ promotions, onPageLoading }) {
  const { isOpen, isPosiflexLoginModalVisible, activeUrl } = useLogin();
  const corporateUser = useUserType();
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [bottomSheetFlightsVisible, setBottomSheetFlightsVisible] =
    useState(false);
  const bottomSheetFlightsRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [getFormData, setPackagesFormData] = useLocalStorage("formData");
  const [selectedTravelers, setSelectedTravelers] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleTravelerChange = (newTravelers) => {
    setSelectedTravelers(newTravelers);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bottomSheetFlightsRef.current &&
        !bottomSheetFlightsRef.current.contains(event.target)
      ) {
        setBottomSheetFlightsVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [bottomSheetFlightsRef]);

  useEffect(() => {
    setPackagesFormData(null);
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerRef = useRef(null);
  const scrollInterval = 3000;
  const numCardsToShow = 1;

  const cloneCards = () => {
    const container = containerRef.current;
    const cards = container?.querySelectorAll(".promotion-card");
    const numOriginalCards = cards?.length;
    if (numOriginalCards === 0 || numOriginalCards === undefined) return;
    const numClones = numCardsToShow * 2;
    for (let i = 0; i < numClones; i++) {
      const clone = cards[i % numOriginalCards].cloneNode(true);
      container.appendChild(clone);
    }
  };

  const handleRedirect = (id, title, country_name) => {
    const url = redirectPackageDetail(id, title, country_name);
    router.push(url);
  };

  useEffect(() => {
    cloneCards();
    const container = containerRef.current;
    const scrollNext = () => {
      if (!containerRef || !container) return;
      const cardWidth = container.querySelector(".promotion-card")?.offsetWidth;
      const nextCardPosition =
        Math.ceil(container.scrollLeft / cardWidth) * cardWidth;
      container.scrollTo({ left: nextCardPosition, behavior: "smooth" });
    };
    const intervalId = setInterval(scrollNext, scrollInterval);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <div
        className={`relative transition-all duration-300 ${
          isOpen || isPosiflexLoginModalVisible ? "backdrop-blur-sm" : ""
        }`}
      >
        <div className="relative w-full pb-[3%]">
          <Image
            className=" hidden md:block absolute inset-0 z-0 object-cover"
            src={corporateUser ? bannerBg : bigbg}
            alt="banner bg"
            fill
          />
          <Image
            className="block md:hidden absolute w-full h-full object-cover"
            src={mobbg}
            alt="mob bg"
          />
          {!corporateUser ? (
            <div
              className={`relative z-50 ${
                isPosiflexLoginModalVisible ? "" : ""
              }`}
            >
              <B2CHeader />
            </div>
          ) : (
            <div className="relative bg-white z-50">
              <Header />
            </div>
          )}

          {/* Fixed Tab Section */}
          <div className="relative z-40 w-full mx-auto px-1 sm:px-8 mt-10 sm:mt-10">
            <div className="bg-[#0000006b] w-full rounded-xl shadow-lg padding-banner">
              {/* Tab Navigation */}
              <div className="flex justify-between items-center gap-3 border-b border-gray-300 mb-6">
                <div className="flex w-full overflow-x-auto scrollbar-none">
                  {/* Flights Tab */}
                  <button
                    className={`${
                      activeTab === 1
                        ? "border-b-2 border-[#028fa3] text-[#028fa3] font-bold"
                        : "text-[#1C1C1C] text-white hover:text-[#028fa3]"
                    } px-4 py-3 flex gap-3 items-center text-sm sm:text-base whitespace-nowrap transition-colors duration-200`}
                    onClick={() => setActiveTab(1)}
                  >
                    <FontAwesomeIcon
                      icon={faPlane}
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        activeTab === 1 ? "text-[#028fa3]" : "text-white"
                      }`}
                    />
                    <span>Flights</span>
                  </button>

                  {/* Hotels Tab */}
                  <button
                    className={`${
                      activeTab === 2
                        ? "border-b-2 border-[#028fa3] text-[#028fa3] font-bold"
                        : "text-[#1C1C1C] text-white hover:text-[#028fa3]"
                    } px-4 py-3 flex gap-3 items-center text-sm sm:text-base whitespace-nowrap transition-colors duration-200`}
                    onClick={() => setActiveTab(2)}
                  >
                    {activeTab === 2 ? (
                      <Image
                        src={hotel}
                        alt="Hotel Icon"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                    ) : (
                      <Image
                        src={hotel1}
                        alt="Hotel Icon"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                    )}
                    <span>Hotels</span>
                  </button>

                  {/* Packages Tab */}
                  <button
                    className={`${
                      activeTab === 3
                        ? "border-b-2 border-[#028fa3] text-[#028fa3] font-bold"
                        : "text-[#1C1C1C] text-white hover:text-[#028fa3]"
                    } px-4 py-3 flex gap-3 items-center text-sm sm:text-base whitespace-nowrap transition-colors duration-200`}
                    onClick={() => setActiveTab(3)}
                  >
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        activeTab === 3 ? "text-[#028fa3]" : "text-white"
                      }`}
                    />
                    <span>Packages</span>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === 1 && (
                  <div className="animate-fadeIn">
                    <FlightBanner
                      isDropdownVisible={true}
                      // selectedTravelers={selectedTravelers}
                      // setSelectedTravelers={setSelectedTravelers}
                      // handleTravelerChange={handleTravelerChange}
                      // setPageLoading={setPageLoading}
                      // isDropdownVisible={isDropdownVisible}
                      // setIsDropdownVisible={setIsDropdownVisible}
                    />
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="animate-fadeIn">
                    <HotelNavigation
                    // selectedTravelers={selectedTravelers}
                    // setSelectedTravelers={setSelectedTravelers}
                    // handleTravelerChange={handleTravelerChange}
                    // setPageLoading={setPageLoading}
                    />
                  </div>
                )}

                {activeTab === 3 && (
                  <div className="animate-fadeIn">
                    <PackageBanner setPageLoading={setPageLoading} />
                  </div>
                )}
              </div>

              {/* Loading States */}
              {pageLoading && activeTab === 1 && <FlightLoader />}
              {pageLoading && activeTab === 2 && <HotelLoader />}
              {pageLoading && activeTab === 3 && <PackageLoader />}
            </div>
          </div>

          {onPageLoading && onPageLoading(pageLoading)}

          {/* {promotions?.length > 0 && (
            <div className="w-full px-[2%] mt-[8%]">
              <div className="block md:hidden text-center bg-black/10 backdrop-blur-sm">
                <h2 className="text-5xl font-bold text-black small-caps">
                  Promotions for you
                </h2>
                <div className="w-[9%] h-1 bg-teal-600 mx-auto mt-1"></div>
                <div
                  className="flex gap-2.5 px-[2%] mt-5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar"
                  ref={containerRef}
                >
                  {promotions.map((promotion, index) => {
                    const description = showFullDescription
                      ? promotion.description
                      : promotion.description.slice(0, 100);
                    const descriptionWithoutTags = description.replace(
                      /(<([^>]+)>)/gi,
                      ""
                    );
                    return (
                      <div
                        key={index}
                        className="promotion-card relative w-[285px] h-40 shrink-0 shadow-sm"
                        onClick={() =>
                          handleRedirect(
                            promotion.id,
                            promotion.title,
                            promotion.country_name
                          )
                        }
                      >
                        <video
                          className="w-full h-full object-cover rounded-none"
                          autoPlay
                          loop
                          muted
                        >
                          <source src={promotion.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-3/4 left-5 -translate-y-1/2 text-left text-white">
                          <h6 className="text-3xl font-semibold uppercase mb-2.5">
                            {promotion.country_name}
                          </h6>
                          <div className="text-xs font-medium leading-tight">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: descriptionWithoutTags,
                              }}
                            />
                            {promotion.description.length > 100 &&
                              !showFullDescription && (
                                <Link href="#" className="text-white text-xs">
                                  Read More
                                </Link>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )} */}

          {/* Mobile Features Section */}
          <div className="block md:hidden w-[90%] relative mx-auto mt-[20%] sm:mt-[10%] grid grid-cols-2 gap-3">
            <div className="flex items-center min-w-0">
              <Image
                className="w-[20%] min-w-[35px] max-w-[45px] h-auto flex-shrink-0"
                src={feature1}
                alt="feature 1"
              />
              <div className="ml-2 text-white min-w-0 flex-1">
                <h3 className="text-[3.5vw] font-bold leading-tight">TRAVEL</h3>
                <p className="hidden sm:block text-[2.8vw] leading-snug">
                  Embracing new experiences
                </p>
              </div>
            </div>

            <div className="flex items-center min-w-0">
              <Image
                className="w-[20%] min-w-[35px] max-w-[45px] h-auto flex-shrink-0"
                src={feature2}
                alt="feature 2"
              />
              <div className="ml-2 text-white min-w-0 flex-1">
                <h3 className="text-[3.5vw] font-bold leading-tight">
                  Efficiency
                </h3>
                <p className="hidden sm:block text-[2.8vw] leading-snug">
                  Streamlined Bookings
                </p>
              </div>
            </div>

            <div className="flex items-center min-w-0">
              <Image
                className="w-[20%] min-w-[35px] max-w-[45px] h-auto flex-shrink-0"
                src={feature3}
                alt="feature 3"
              />
              <div className="ml-2 text-white min-w-0 flex-1">
                <h3 className="text-[3.5vw] font-bold leading-tight">
                  Personalization
                </h3>
                <p className="hidden sm:block text-[2.8vw] leading-snug">
                  Catering to your needs
                </p>
              </div>
            </div>

            <div className="flex items-center min-w-0">
              <Image
                className="w-[20%] min-w-[35px] max-w-[45px] h-auto flex-shrink-0"
                src={feature4}
                alt="feature 4"
              />
              <div className="ml-2 text-white min-w-0 flex-1">
                <h3 className="text-[3.5vw] font-bold leading-tight">
                  Hospitality
                </h3>
                <p className="hidden sm:block text-[2.8vw] leading-snug">
                  24/7 Assistance provided
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Features Section */}
        <div className="hidden md:flex w-[90%] mx-auto mt-[3%] justify-between">
          {[
            {
              src: feature1,
              title: "TRAVEL",
              desc: "Embracing new experiences",
            },
            {
              src: feature2,
              title: "Efficiency",
              desc: "Streamlined Bookings",
            },
            {
              src: feature3,
              title: "Personalization",
              desc: "Catering to your needs",
            },
            {
              src: feature4,
              title: "Hospitality",
              desc: "24/7 Assistance provided",
            },
          ].map((feature, index) => (
            <div key={index} className="flex items-center">
              <Image
                className="w-1/4 h-auto"
                src={feature.src}
                alt={`feature ${index + 1}`}
              />
              <div className="ml-5 text-teal-600">
                <h3 className="text-[1.3vw] font-bold mb-0">{feature.title}</h3>
                <p className="text-[1vw] max-w-max mb-2">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Customers Section */}
        <div className="text-center text-xl md:text-[2vw] font-medium text-black small-caps mt-[3%]">
          Our Esteemed Customers
        </div>
        <div className="w-[9%] h-1 bg-teal-600 mx-auto mt-1"></div>
        <Carousel />
      </div>
      {routeLoading && <Loader />}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
