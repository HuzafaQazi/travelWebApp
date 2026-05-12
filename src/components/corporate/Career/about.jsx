import Image from "next/image";
import "tailwindcss/tailwind.css";
import { useState } from "react";

const images = [
  {
    src: "/img/corporate/career/IMG_3130.JPG",
    text: "Understanding the travel industry's demanding nature, Qugo emphasizes a healthy work-life balance with flexible work arrangements, wellness programs, and opportunities for personal growth.",
  },
  {
    src: "/img/corporate/career/Image (3).jpg",
    text: "Life at Qugo is not all work. Regular team-building activities, themed events, and travel-inspired celebrations ensure employees stay connected and motivated.",
  },
  {
    src: "/img/corporate/career/Image (1).jpg",
    text: "Qugo employees gain insights into the travel industry's intricacies, from flight bookings and hotel management to customer engagement strategies. The exposure to this vibrant sector helps team members broaden their expertise and stay ahead in their fields.",
  },
  {
    src: "/img/corporate/career/Image (4).jpg",
    text: "The fast-paced nature of the travel industry is mirrored in Qugo's dynamic and energetic work culture. Employees thrive in a setting that encourages adaptability, creativity, and out-of-the-box problem-solving.",
  },
  {
    src: "/img/corporate/career/DSC_2200.JPG",
    text: "Cross-functional teamwork is a cornerstone of life at Qugo. Teams work together across domains such as software development, data analysis, and product design to create solutions tailored to travelers' needs.",
  },
  {
    src: "/img/corporate/career/sAMPLE.jpg",
    text: "Employees at Qugo contribute to building software solutions that transform how people explore the world. Every project is an opportunity to create seamless, user-friendly experiences for travelers and businesses in the travel sector.",
  }, // Add a new full-width image
];

const ImageZoomOnHover = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="py-2">
      <div className="flex items-center justify-center ">
        <div className="border-2 ml-[3%] w-fit border-dashed rounded-xl border-[#028fa3] p-4 text-center">
          <h1 className="text-4xl font-bold text-black">Life At Qugo</h1>
        </div>
      </div>

      <p className="text-lg md:text-xl text-gray-700 text-center leading-relaxed mx-auto py-3 w-[94%] mb-2 font-sans">
        At Qugo, a travel-focused software company, life revolves around
        innovation, collaboration, and a passion for redefining the travel
        experience. The company provides employees with an enriching environment
        that combines the excitement of the travel industry with cutting-edge
        technology
      </p>

      {/* Full-width image at the top */}
      <div
        className="relative w-[94%] h-[400px] overflow-hidden rounded-lg mt-3 mx-[3%] mb-3"
        onMouseEnter={() => setHoveredIndex(5)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <Image
          src={images[5].src}
          alt="Full-Width Image"
          layout="fill"
          objectFit="cover"
          style={{
            transition: "transform 0.3s ease-in-out",
            transform: hoveredIndex === 5 ? "scale(1.2)" : "scale(1)",
          }}
        />
        <div
          className={`absolute inset-0 bg-[#028fa3] bg-opacity-30 flex items-center  px-[10%] justify-center text-white text-xl font-semibold transition-opacity duration-300 ${
            hoveredIndex === 5 ? "opacity-100" : "opacity-0"
          }`}
        >
          {images[5].text}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-4 md:grid-cols-4 gap-2 mx-[3%] mt-3 mb-3">
        {/* First image */}
        <div
          className="relative w-full h-[250px] overflow-hidden rounded-lg col-span-2 md:col-span-1"
          onMouseEnter={() => setHoveredIndex(0)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Image
            src={images[0].src}
            alt="Insta Post 1"
            layout="fill"
            objectFit="cover"
            style={{
              transition: "transform 0.3s ease-in-out",
              transform: hoveredIndex === 0 ? "scale(1.2)" : "scale(1)",
            }}
          />
          <div
            className={`absolute inset-0 bg-[#028fa3] bg-opacity-30 flex px-2 items-center justify-center text-white text-sm font-semibold transition-opacity duration-300 ${
              hoveredIndex === 0 ? "opacity-100" : "opacity-0"
            }`}
          >
            {images[0].text}
          </div>
        </div>

        {/* Second image */}
        <div
          className="relative w-full h-[250px] overflow-hidden rounded-lg col-span-2 md:col-span-1"
          onMouseEnter={() => setHoveredIndex(1)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Image
            src={images[1].src}
            alt="Insta Post 2"
            layout="fill"
            objectFit="cover"
            style={{
              transition: "transform 0.3s ease-in-out",
              transform: hoveredIndex === 1 ? "scale(1.2)" : "scale(1)",
            }}
          />
          <div
            className={`absolute inset-0 bg-[#028fa3] bg-opacity-30 px-2 flex items-center justify-center text-white text-sm font-semibold transition-opacity duration-300 ${
              hoveredIndex === 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            {images[1].text}
          </div>
        </div>

        {/* Third image - spanning two rows */}
        <div
          className="relative w-full h-[510px] overflow-hidden rounded-lg col-span-2 row-span-2 hidden md:block "
          onMouseEnter={() => setHoveredIndex(2)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Image
            src={images[2].src}
            alt="Family Time"
            layout="fill"
            objectFit="cover"
            style={{
              transition: "transform 0.3s ease-in-out",
              transform: hoveredIndex === 2 ? "scale(1.2)" : "scale(1)",
            }}
          />
          <div
            className={`absolute inset-0 bg-[#028fa3] bg-opacity-30 flex items-center  px-[10%] justify-center text-white text-xl font-semibold transition-opacity duration-300 ${
              hoveredIndex === 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            {images[2].text}
          </div>
        </div>

        {/* Fourth image */}
        <div
          className="relative w-full h-[250px] overflow-hidden rounded-lg col-span-2 md:col-span-1"
          onMouseEnter={() => setHoveredIndex(3)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Image
            src={images[3].src}
            alt="Insta Post 3"
            layout="fill"
            objectFit="cover"
            style={{
              transition: "transform 0.3s ease-in-out",
              transform: hoveredIndex === 3 ? "scale(1.2)" : "scale(1)",
            }}
          />
          <div
            className={`absolute inset-0 bg-[#028fa3] bg-opacity-30 flex px-2 items-center justify-center text-white text-sm font-semibold transition-opacity duration-300 ${
              hoveredIndex === 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            {images[3].text}
          </div>
        </div>

        {/* Fifth image */}
        <div
          className="relative w-full h-[250px] overflow-hidden rounded-lg col-span-2 md:col-span-1 "
          onMouseEnter={() => setHoveredIndex(4)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <Image
            src={images[4].src}
            alt="Vertical Image"
            layout="fill"
            objectFit="cover"
            style={{
              transition: "transform 0.3s ease-in-out",
              transform: hoveredIndex === 4 ? "scale(1.2)" : "scale(1)",
            }}
          />
          <div
            className={`absolute inset-0 bg-[#028fa3] bg-opacity-30 flex px-2 items-center justify-center text-white text-sm font-semibold transition-opacity duration-300 ${
              hoveredIndex === 4 ? "opacity-100" : "opacity-0"
            }`}
          >
            {images[4].text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageZoomOnHover;
