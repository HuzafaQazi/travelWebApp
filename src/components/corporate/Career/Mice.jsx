import Image from "next/image";
import "tailwindcss/tailwind.css";

const HolidaySection = () => {
  return (
    <>
      <div className="flex flex-col justify-center items-center text-center py-3">
        <div className="border-2 w-fit border-dashed rounded-xl border-[#028fa3] p-4 text-center">
          <h1 className="text-4xl font-bold text-black">
            Our Vision and Mission
          </h1>
        </div>

        <p className="text-lg md:text-xl text-gray-700 leading-relaxed w-[95%] mb-2 mt-4 font-sans">
          Driving Innovation, Empowering Growth, and Shaping a Better Tomorrow
        </p>
      </div>
      <div className="flex flex-wrap justify-center items-center bg-white p-2 rounded-lg shadow-md">
        {/* Left Section */}

        {/* Right Section - Cards */}
        <div className=" w-full lg:w-2/3 overflow-scroll hide-scrollbar">
          <div className=" grid grid-cols-3 gap-2 min-w-[900px] md:min-w-0 md:gap-1  ">
            {/* First Card */}
            <div className="w-full ">
              <div className="overflow-hidden rounded-lg shadow-md">
                <Image
                  src="/img/corporate/career/Artboard 2 5.jpg"
                  alt="Varanasi"
                  className="w-full h-48 object-cover"
                  width={300}
                  height={300}
                />
                <div className="p-4">
                  <p className="text-sm text-gray-700 text-center flex flex-col">
                    <strong className="text-[#028fa3] text-center text-lg">
                      Qugo
                    </strong>{" "}
                    Conveniently book flights, hotels, and packages with ease,
                    ensuring personalized options, affordability, and seamless
                    travel experiences for every journey.
                  </p>
                </div>
              </div>
            </div>

            {/* Second Card */}
            <div className="w-full ">
              <div className="overflow-hidden rounded-lg shadow-md">
                <Image
                  src="/img/corporate/career/corporate.jpg"
                  alt="Bodh Gaya"
                  className="w-full h-48 object-cover"
                  width={300}
                  height={300}
                />
                <div className="p-4">
                  <p className="text-sm text-center flex flex-col text-gray-700">
                    <strong className="text-[#028fa3] text-lg">
                      Qugo Corporate
                    </strong>
                    A corporate tool booking system with built-in approval
                    workflows and integrated travel policy compliance.
                    Streamline travel arrangements.
                  </p>
                </div>
              </div>
            </div>

            {/* Third Card */}
            <div className="w-full ">
              <div className="overflow-hidden rounded-lg shadow-md">
                <Image
                  src="/img/corporate/career/Mice.jpg"
                  alt="Bodhgaya Monastery"
                  className="w-full h-48 object-cover"
                  width={300}
                  height={300}
                />
                <div className="p-4">
                  <p className="text-sm text-gray-700 text-center flex flex-col">
                    <strong className="text-[#028fa3] text-lg">
                      Qugo MICE
                    </strong>{" "}
                    MICE organizes meetings, incentives, conferences and events,
                    driving collaboration, innovation, and business growth
                    through impactful events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HolidaySection;
