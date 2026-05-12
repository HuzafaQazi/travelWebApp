import "tailwindcss/tailwind.css";
import image1 from "../../../../public/img/corporate/career/_ANI8433.JPG";
import image2 from "../../../../public/img/corporate/career/IMG_7221.JPG";
import image3 from "../../../../public/img/corporate/career/DSC_6785.JPG";
import image4 from "../../../../public/img/corporate/career/IMG_7031.JPG";
import image5 from "../../../../public/img/corporate/career/IMG_7243.JPG";
import image6 from "../../../../public/img/corporate/career/IMG_8827.JPG";
import Image from "next/image";

const images = [image1, image2, image3, image4, image5, image6];

const ImageCarousel = () => {
  return (
    <>
      <div className="py-5">
        <div className="flex items-center justify-center ">
          <div className="border-2 ml-[5%] w-fit border-dashed rounded-xl border-[#028fa3] p-4 text-center">
            <h1 className="text-4xl font-bold text-black">
              Defining Moments Together
            </h1>
          </div>
        </div>

        <p className="text-lg md:text-xl text-gray-700 text-center leading-relaxed mx-auto py-3 w-[90%] mb-2 font-sans">
          A collection of cherished memories showcasing our journey of growth,
          collaboration, and achievement. These snapshots reflect the spirit of
          teamwork and the milestones we&rsquo;ve celebrated together. From
          challenges conquered to victories shared, these moments remind us of
          the passion, dedication, and camaraderie that drive our success every
          day.
        </p>

        {/* Carousel scrolling right */}
        <div className="overflow-hidden w-full md:w-[90%] mx-auto bg-white flex justify-center items-center rounded-md ">
          <div className="carousel-track flex w-[200%] gap-1 animate-scroll-right bg-white py-1 space-x-1">
            {images.concat(images).map((image, index) => (
              <div key={index} className="flex-shrink-0 w-[400px] h-[280px]">
                <Image
                  src={image.src}
                  alt={`Image ${index}`}
                  className="w-[400px] h-[280px]"
                  width={300}
                  height={300}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageCarousel;
