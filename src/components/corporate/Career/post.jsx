import Image from "next/image";
import "tailwindcss/tailwind.css";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const sections = [
  {
    title: "#Instagram Posts",
    images: [
      {
        src: "/img/corporate/career/image.jpg",
        text: "Are you looking for a group that travels and does crazy stuff together? Join us on wild adventures, unforgettable experiences, and making memories with awesome new friends! 🌟🚀 #TravelSquadGoals #AdventureAwaits #TravelTogether #CrazyAdventures #JoinTheFun #TravelCommunity",
        link: "https://www.instagram.com/reel/C94ZFlFxmFB/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", // Add link for Instagram post
      },
      {
        src: "/img/corporate/career/image (2).jpg",
        text: "🚀 Save BIG, Travel SMART! 💼Our CEO, Udit, shares how Qugos technology is helping corporates save lakhs every month while streamlining their travel bookings. ✈️📈",
        link: "https://www.instagram.com/reel/DCrLYu_yTic/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", // Add link for Instagram post
      },
      {
        src: "/img/corporate/career/image (3)_1.jpg",
        text: "🍁 Discover Kashmir—Indias Paradise on Earth! 🍁",
        link: "https://www.instagram.com/reel/DCHGgpAS43C/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", // Add link for Instagram post
      },
      {
        src: "/img/corporate/career/image (4)_1.jpg",
        text: "Elevate your event experience with QuGo MICE at our meticulously planned Partner Meet 2024! Qugo organized an successful partner meet for Posiflex India. These are the glimpses of the event.Qugo team makes sure to Enhance Corporate Travel, Holiday Packages, and MICE Experiences with the most effective Technology.",
        link: "https://www.instagram.com/reel/C_XY0tNhm8w/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", // Add link for Instagram post
      },
      {
        src: "/img/corporate/career/image (5).jpg",
        text: "Discover the allure of Bali, where every moment is a postcard-worthy memory waiting to happen! 📸Let the islands beauty capture your heart and soul.",
        link: "https://www.instagram.com/p/C4xGW9TNr3d/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", // Add link for Instagram post
      },
      {
        src: "/img/corporate/career/image (6).jpg",
        text: "Experience the magic of our meticulously planned sales meet for Posiflex in 2024! From dynamic conferences to glamorous gala dinners, QuGo MICE leaves no stone unturned.Check out the highlights from this unforgettable event!",
        link: "https://www.instagram.com/reel/C3wsfSVR75i/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==", // Add link for Instagram post
      },
    ],
  },
  {
    title: "#LinkedIn Posts",
    images: [
      {
        src: "/img/corporate/career/Linkdin post1.jpg",
        text: "And with every small step, making success a habit! QuGo FAMILY!",
        link: "https://www.linkedin.com/posts/qugotrips_for-all-this-time-that-we-have-been-working-activity-7225020043980324865-8lXi?utm_source=share&utm_medium=member_desktop", // Add link for LinkedIn post
      },
      {
        src: "/img/corporate/career/Likdin 2.jpg",
        text: "This is what we live for! Happy customers! Qugo planned Leh Ladakh trip for Mrs Nandini. These are the beautiful glimpses of her trip! If you are planning for travelling to such beautiful destinations, join our community to get all the important information of our upcoming trips!",
        link: "https://www.linkedin.com/posts/qugotrips_this-is-what-we-live-for-happy-customers-activity-7231603691085029376-w4_O?utm_source=share&utm_medium=member_desktop", // Add link for LinkedIn post
      },
      {
        src: "/img/corporate/career/Linkdin3.jpg",
        text: "The unpredictability of travel lends to the feeling of adventure and challenges are never welcome.The best way is to over plan even before you leave home. We listed some major and common challenges.",
        link: "https://www.linkedin.com/posts/qugotrips_qugotravel-travellife-travelers-activity-7209088227452821505-KpAy?utm_source=share&utm_medium=member_desktop", // Add link for LinkedIn post
      },
      {
        src: "/img/corporate/career/Linkdin4.jpg",
        text: "When it comes to family trip, Be Punctual, Be Spiritual and Be Silent",
        link: "https://www.linkedin.com/posts/qugotrips_qugotravels-travellingwithfamily-familytrips-activity-7196443713928130560-8Tdw?utm_source=share&utm_medium=member_desktop", // Add link for LinkedIn post
      },
      {
        src: "/img/corporate/career/Linkdin 5.jpg",
        text: "Every journey has a unique story to tell and moments to cherish. Entrench all your travel diaries in your heart and always be in thirst to explore new destinations with your pals. Life is a one time fest so make it the best!",
        link: "https://www.linkedin.com/posts/qugotrips_qugotravel-travelmemories-travelling-activity-7196046284674244608-B3sC?utm_source=share&utm_medium=member_desktop", // Add link for LinkedIn post
      },
    ],
  },
];

const ImageOverlayCarousel = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const scrollRefs = useRef([]); // Use a ref for each section

  const scrollLeft = (sectionIndex) => {
    if (scrollRefs.current[sectionIndex]) {
      scrollRefs.current[sectionIndex].scrollBy({
        left: -330,
        behavior: "smooth",
      }); // Scroll 3 * 320px
    }
  };

  const scrollRight = (sectionIndex) => {
    if (scrollRefs.current[sectionIndex]) {
      scrollRefs.current[sectionIndex].scrollBy({
        left: 330,
        behavior: "smooth",
      }); // Scroll 3 * 320px
    }
  };

  return (
    <div className="p-3">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-6 relative">
          {/* Section Title */}
          <div className="text-2xl text-gray-500 font-semibold">
            {section.title}
          </div>

          {/* Carousel Container */}
          <div
            className="flex gap-2 overflow-hidden mt-3 relative"
            ref={(el) => (scrollRefs.current[sectionIndex] = el)} // Attach ref for this section
          >
            {section.images.map((image, index) => {
              // Inline styles for zoom and opacity
              const imageStyle = {
                transition: "transform 0.3s ease-in-out",
                transform:
                  hoveredIndex === `${sectionIndex}-${index}`
                    ? "scale(1.2)"
                    : "scale(1)",
              };

              const overlayStyle = {
                opacity: hoveredIndex === `${sectionIndex}-${index}` ? 1 : 0,
                transition: "opacity 0.3s ease-in-out",
              };

              return (
                <div
                  key={index}
                  className="relative w-[303px] h-[300px] flex-shrink-0 overflow-hidden cursor-pointer rounded-xl"
                  onMouseEnter={() =>
                    setHoveredIndex(`${sectionIndex}-${index}`)
                  }
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => window.open(image.link, "_blank")}
                >
                  {/* Image Link Wrapper */}
                  <a
                    href={image.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full absolute top-0 left-0"
                  >
                    <div className="w-full h-full relative">
                      <Image
                        src={image.src}
                        alt={`Image ${index}`}
                        layout="fill"
                        objectFit="cover"
                        className="w-full h-full"
                        style={imageStyle} // Apply zoom-in effect via inline style
                      />
                    </div>
                  </a>

                  {/* Overlay */}
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    style={overlayStyle} // Apply fade-in effect via inline style
                  >
                    <p className="text-white text-sm px-3 font-semibold">
                      {image.text}
                    </p>
                  </div>

                  {/* Social Media Icon */}
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    {section.title === "Instagram Posts" && (
                      <FontAwesomeIcon
                        icon={faInstagram}
                        className="text-white text-2xl"
                      />
                    )}
                    {section.title === "LinkedIn Posts" && (
                      <FontAwesomeIcon
                        icon={faLinkedin}
                        className="text-white text-2xl"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left Arrow outside the container */}
          <button
            onClick={() => scrollLeft(sectionIndex)}
            className="absolute left-[-30px] top-[55%] transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75 transition"
          >
            <FontAwesomeIcon icon={faAngleLeft} className="text-2xl" />
          </button>

          {/* Right Arrow outside the container */}
          <button
            onClick={() => scrollRight(sectionIndex)}
            className="absolute right-[-30px] top-[55%] transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75 transition"
          >
            <FontAwesomeIcon icon={faAngleRight} className="text-2xl" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImageOverlayCarousel;
