import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faCheck,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import style from "../../booking/styles.module.css";

const LazyImage = ({ src, alt, width, height, className }) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current && !isLoaded) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [isLoaded]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  if (isLoaded) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isInView ? (
        <>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleImageLoad}
            className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"}`}
            style={{ transition: "opacity 0.3s" }}
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </>
      ) : (
        <div className={`${className} bg-gray-200`} />
      )}
    </div>
  );
};

const ViewMore = ({ onClose, data }) => {
  const [selectedTab, setSelectedTab] = useState("About");
  const [showAllImages, setShowAllImages] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const facilities = data?.hotelFacilities || [];
  const visibleFacilities = showAll ? facilities : facilities.slice(0, 5);

  const aboutRef = useRef(null);
  const amenitiesRef = useRef(null);
  const locationRef = useRef(null);

  const openLightbox = (startIndex) => {
    setLightboxVisible(true);
    setCurrentImageIndex(startIndex);
  };

  const closeLightbox = () => setLightboxVisible(false);

  const nextImage = () => {
    if (currentImageIndex < data.hotelPictures.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prevIndex) => prevIndex - 1);
    }
  };

  useEffect(() => {
    if (lightboxVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [lightboxVisible]);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
    if (tab === "About")
      aboutRef.current?.scrollIntoView({ behavior: "smooth" });
    else if (tab === "Amenities")
      amenitiesRef.current?.scrollIntoView({ behavior: "smooth" });
    else if (tab === "Location")
      locationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleImageView = () => {
    setShowAllImages(!showAllImages);
  };

  // Calculate remaining images count only if there are more than 5 images
  const remainingImagesCount =
    data?.hotelPictures?.length > 5 ? data.hotelPictures.length - 5 : 0;

  // Determine whether to show the "+X more" overlay
  const showMoreOverlay = data?.hotelPictures?.length > 5;

  useEffect(() => {
    const sections = [
      { tab: "About", ref: aboutRef },
      { tab: "Amenities", ref: amenitiesRef },
      { tab: "Location", ref: locationRef },
    ];

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = sections.find(
            (section) => section.ref.current === entry.target
          );
          if (section) {
            setSelectedTab(section.tab);
          }
        }
      });
    }, observerOptions);

    sections.forEach((section) => {
      if (section.ref.current) {
        observer.observe(section.ref.current);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section.ref.current) {
          observer.unobserve(section.ref.current);
        }
      });
    };
  }, []);

  return (
    <>
      <div className="flex justify-end"></div>
      <div className="flex">
        <div className="text-[#171A19] font-semibold text-2xl">
          {data.hotelName}
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className={`w-4 h-4 ms-1 ${
                index < data.starRating
                  ? "text-[#DB884C]"
                  : "text-gray-300 dark:text-gray-500"
              }`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 22 20"
            >
              <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
            </svg>
          ))}
        </div>
      </div>
      <div className="text-[#878786] font-normal text-xs">{data.address}</div>
      <div className="flex gap-20 border-b border-gray-300 mt-3">
        {["About", "Amenities", "Location"].map((tab) => (
          <div
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`pb-2 cursor-pointer ${
              selectedTab === tab
                ? "border-b-2 border-[#028FA3] text-[#028FA3] font-semibold"
                : "border-b-2 border-transparent text-black hover:border-[#028FA3] hover:text-[#028FA3]"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className={style.ViewRoomContainer}>
        <div className="flex mt-3">
          <div
            className="w-1/2 pr-2 cursor-pointer"
            onClick={() => openLightbox(0)}
          >
            <LazyImage
              src={data.hotelPictures?.[0]}
              alt="Main hotel image"
              width={1000}
              height={1000}
              className="w-full h-[200px] rounded-lg"
            />
          </div>
          <div className="w-1/2 grid grid-cols-2 gap-2">
            {data?.hotelPictures?.slice(1, 5)?.map((src, index) => (
              <div
                key={index}
                className="relative cursor-pointer"
                onClick={() => openLightbox(index + 1)}
              >
                <LazyImage
                  src={src}
                  alt={`Hotel image ${index + 1}`}
                  width={1000}
                  height={1000}
                  className="w-full h-[97px] rounded-lg"
                />

                {showMoreOverlay && index === 3 && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg cursor-pointer"
                    onClick={() => openLightbox(4)}
                  >
                    <button
                      onClick={() => openLightbox(4)}
                      className="mt-2 text-white font-semibold text-xl cursor-pointer"
                    >
                      +{remainingImagesCount}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {showAllImages && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {data.hotelPictures.slice(5).map((src, index) => (
              <div key={index} className="relative">
                <LazyImage
                  src={src}
                  alt={`Hotel image ${index + 5}`}
                  width={1000}
                  height={1000}
                  className="w-full h-[97px] rounded-lg"
                />
              </div>
            ))}
          </div>
        )}

        {showAllImages && (
          <button
            onClick={toggleImageView}
            className="mt-2 text-blue-500 hover:text-blue-700"
          >
            View Less
          </button>
        )}

        {lightboxVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <button
              onClick={prevImage}
              className={`absolute left-[15%] 2xl:left-[30%]  text-black font-bold text-base bg-white p-2 rounded-full ${
                currentImageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={currentImageIndex === 0}
            >
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>

            <div className=" relative flex justify-center items-center">
              <button
                onClick={closeLightbox}
                className="absolute -top-5 -right-5  px-2 p-1 rounded-full text-white font-bold text-2xl"
              >
                <FontAwesomeIcon icon={faXmarkCircle} />
              </button>
              <LazyImage
                src={data.hotelPictures[currentImageIndex]}
                alt={`Hotel image ${currentImageIndex + 1}`}
                width={1000}
                height={1000}
                className="w-[700px] h-[500px] rounded-lg"
              />
            </div>

            <button
              onClick={nextImage}
              className={`absolute right-[15%] 2xl:right-[30%] text-black font-bold text-base bg-white p-2 rounded-full ${
                currentImageIndex === data.hotelPictures.length - 1
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={currentImageIndex === data.hotelPictures.length - 1}
            >
              <FontAwesomeIcon icon={faAngleRight} />
            </button>
          </div>
        )}

        <div ref={aboutRef}>
          <div className="text-[#171A19] font-semibold text-lg mt-2">About</div>
          <div
            className="text-[#171A19] font-normal text-sm mt-2 flex flex-col gap-[15px]"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
        </div>
        <div ref={amenitiesRef}>
          <div className="text-[#171A19] font-semibold text-lg mt-2">
            Facilities & Amenities
          </div>
          {/* <div className="grid grid-cols-2 gap-3 mt-2">
            {data?.hotelFacilities?.map((facility, index) => (
              <div key={index} className="flex items-center">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-[#028FA3] mr-2"
                />
                <span className="text-sm">{facility}</span>
              </div>
            ))}
          </div> */}
          <div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {visibleFacilities.map((facility, index) => (
                <div key={index} className="flex items-center">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-[#028FA3] mr-2"
                  />
                  <span className="text-sm">{facility}</span>
                </div>
              ))}
            </div>

            {facilities.length > 5 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-[#028FA3] text-sm mt-2 font-medium hover:underline"
              >
                {showAll ? "View Less" : "View More"}
              </button>
            )}
          </div>
        </div>
        <div ref={locationRef}>
          <div className="text-[#171A19] font-semibold text-lg mt-2">
            Location
          </div>
          <div className="text-[#171A19] font-normal text-sm mt-2">
            {data.address}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewMore;
