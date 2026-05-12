import third from "../../../../public/img/corporate/mainimage.jpg";
import "tailwindcss/tailwind.css";
import CommonHeader from "@/components/flights/commonHeader/commonHeader";
import B2CHeader from "@/components/flights/B2cHeader/Header";
import ImageCarousel from "../../../components/corporate/Career/imagescroll";
import Posts from "../../../components/corporate/Career/post";
import About from "../../../components/corporate/Career/about";
import Last from "../../../components/corporate/Career/last";
import Mice from "../../../components/corporate/Career/Mice";
import Content from "../../../components/corporate/Career/Content";
import Footer1 from "@/components/footer/footer";
import WhyQugo from "../../../components/corporate/Career/Whyqugo";
import QugoBenefits from "../../../components/corporate/Career/Benefits";

const CareersPage = () => {
  return (
    <div>
      {/* Hero Section with Background Image */}
      <div className="sticky top-0 z-50 h-[10vh] bg-white shadow-md">
        {/* <CommonHeader /> */}
        <B2CHeader isAuthRequired={false} />
      </div>
      <div
        className="relative bg-cover w-full bg-center h-[60vh] md:h-[100vh] "
        style={{ backgroundImage: `url(${third.src})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-left  text-white ml-[8%] justify-center items-center">
          <div className="text-4xl md:text-6xl lg:text-[6rem] font-bold justify-center items-center pt-[8%] leading-tight md:leading-[1.1] break-words">
            Embark Your
            <br /> Career Journey
            <br /> with Qugo
          </div>
          <button
            className="mt-6 px-6 py-3 bg-teal-500 text-white font-semibold rounded hover:bg-teal-600 transition"
            onClick={() => window.open("https://hr-1.in/92b46c", "_blank")}
          >
            Explore Roles
          </button>
        </div>
      </div>
      <div className="relative">
        {/* Gradient at the left edge */}
        <div className="absolute top-0 left-0 h-full w-[10vw] bg-gradient-to-r from-[#028fa360] to-transparent z-10 pointer-events-none" />

        {/* Gradient at the right edge */}
        <div className="absolute top-0 right-0 h-full w-[10vw] bg-gradient-to-l from-[#028fa360] to-transparent z-10 pointer-events-none" />

        {/* Main content */}
        <div className="relative z-0 mx-[3%]">
          <Content />
          <WhyQugo />
          <QugoBenefits />
          <div className="md:mx-[2%]">
            <About />
          </div>

          <div className="md:mx-[4.5%]">
            <Mice />
          </div>
          <ImageCarousel />
          <div className="md:mx-[3.5%]">
            <Posts />
          </div>
          <Last />
        </div>
      </div>
      <div className="-mt-[5%]">
        <Footer1 />
      </div>
    </div>
  );
};

export default CareersPage;
