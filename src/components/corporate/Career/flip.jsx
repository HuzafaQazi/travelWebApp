import Image from "next/image";
import "tailwindcss/tailwind.css";
import { useState } from "react";

const images = [
  { src: "/img/corporate/background.jpg", text: "Background Image" },
  { src: "/img/corporate/insta1 (1).jpg", text: "Artboard Design" },
  { src: "/img/corporate/family.jpg", text: "Family Time" },
];

const ImageFlipOnHoverJS = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="p-3">
      <div className="text-2xl text-black font-semibold ml-10">
        Image Flip on Hover
      </div>
      <div className="flex gap-4 flex-wrap justify-center mt-3 mb-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative w-[400px] h-[300px] overflow-hidden rounded-lg"
            onMouseEnter={() => handleMouseEnter(index)} // Set hovered index
            onMouseLeave={handleMouseLeave} // Reset hovered index
          >
            {/* Front Side (Image) */}
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-500 transform ${
                hoveredIndex === index ? "rotate-x-180" : "rotate-x-0"
              }`}
            >
              <Image
                src={image.src}
                alt={`Image ${index}`}
                layout="fill"
                objectFit="cover"
                className="w-full h-full"
              />
            </div>

            {/* Back Side (Text) */}
            {hoveredIndex === index && (
              <div
                className={`absolute inset-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center text-white text-lg font-semibold transition-transform duration-500 transform ${
                  hoveredIndex === index ? "rotate-y-0" : "rotate-x-180"
                }`}
              >
                {image.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageFlipOnHoverJS;
