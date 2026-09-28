import React, { useState } from "react";
import Image from "next/image";
import Stay1 from "@/images/corporate/C1.png";
import Stay from "@/images/corporate/International business most visited.png";
import Stay2 from "@/images/corporate/Corporate events.png";
import Stay3 from "@/images/corporate/Domestic business most visited.png";
import Stay4 from "@/images/corporate/business hotel offer.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const CorporatePackages = () => {
  const imageData = [
    {
      src: Stay1,
      text1: "MICE",
      text: "Management to ease your corporate events",
    },
    { src: Stay4, text1: "40% Off", text: "Exclusive Deal on Hotels" },
    {
      src: Stay2,
      text1: "",
      text: "Meeting, Incentives, Corporate and Events Management",
    },
    {
      src: Stay3,
      text1: "",
      text: "Discover most often visited Indian business cities",
    },
    {
      src: Stay,
      text1: "",
      text: "Discover most often visited International business cities",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(
    Math.floor(imageData.length / 2)
  );

  const handleImageClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="mt-6 mb-3">
      <div className="bg-white w-full rounded-lg p-3 mt-2">
        <div className="flex gap-3 ">
          <div className="text-[#1C1C1C] text-lg font-semibold">
            Corporate Packages
          </div>
          <div className="text-[#155EEF] text-lg font-medium flex items-center cursor-pointer">
            View All
            <FontAwesomeIcon icon={faChevronRight} className="h-4 ml-1" />
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 overflow-x-auto h-[700px] mt-3">
          {imageData.map((item, index) => (
            <div
              key={index}
              className={`relative cursor-pointer transition-all duration-300 ease-in-out ${
                activeIndex === index
                  ? "w-[700px] h-[604px]"
                  : "w-[100px] h-[554px]"
              } flex-shrink-0`}
              onClick={() => handleImageClick(index)}
            >
              <div
                className={`absolute inset-0 z-10 ${
                  activeIndex === index ? "rounded-3xl" : "rounded-full"
                }`}
                style={{
                  background:
                    "linear-gradient(176.35deg, rgba(6, 22, 24, 0) 34.6%, #000000 99.86%)",
                }}
              ></div>
              <Image
                src={item.src}
                alt={`image-${index}`}
                layout="fill"
                objectFit="cover"
                className={`${
                  activeIndex === index ? "rounded-3xl" : "rounded-full"
                }`}
              />
              {activeIndex === index && (
                <div className="flex flex-col justify-center absolute bottom-10 left-4 text-white text-lg z-20 px-[15%]">
                  <div className="text-[#FFFFFF] text-3xl font-black">
                    {" "}
                    {item.text1}
                  </div>
                  <div className="text-[#FFFFFF] text-xl font-semibold">
                    {item.text}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CorporatePackages;
