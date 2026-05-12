import Image from "next/image";

const LastSection = () => {
  return (
    <div className=" text-white pb-8">
      <div className="container flex flex-col gap-4 justify-center items-center text-center">
        {/* Title */}

        <div className="border-2 w-fit border-dashed rounded-xl border-[#028fa3] p-4 text-center">
          <h1 className="text-4xl font-bold text-black">Follow Our Journey</h1>
        </div>

        <p className="text-lg md:text-xl text-gray-700 leading-relaxed w-[95%] mb-2 font-sans">
          Connect with us on social media for updates, tips, and news about our
          company.
        </p>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6">
          {/* Facebook */}
          <a
            href="https://www.facebook.com/qugotravel/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl hover:text-blue-600 transition-colors duration-300"
          >
            <Image
              src="/img/corporate/career/Facebook.jpg" // Replace with actual image path
              alt="Facebook"
              className="w-12 h-12 hover:opacity-80 transition-opacity duration-300"
              width={100}
              height={100}
            />
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/qugotravel/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl hover:text-pink-600 transition-colors duration-300"
          >
            <Image
              src="/img/corporate/career/Instgram.jpg" // Replace with actual image path
              alt="Instagram"
              className="w-12 h-12 hover:opacity-80 transition-opacity duration-300"
              width={100}
              height={100}
            />
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/qugotrips/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl hover:text-blue-700 transition-colors duration-300"
          >
            <Image
              src="/img/corporate/career/Linkdin.jpg" // Replace with actual image path
              alt="LinkedIn"
              className="w-12 h-12 hover:opacity-80 transition-opacity duration-300"
              width={100}
              height={100}
            />
          </a>
        </div>

        <button
          className="mt-6 px-6 py-3 bg-teal-500 text-white text-lg font-semibold rounded hover:bg-teal-600 transition"
          onClick={() => window.open("https://hr-1.in/92b46c", "_blank")}
        >
          Explore Job Oppurtunity
        </button>
        <div className="text-lg text-black">or</div>
        <div className="flex text-xl space-x-1 text-black">
          <span>Mail us :</span>
          <a
            href="mailto:hr@qugo.io"
            className="flex gap-1 text-xl text-black items-center"
          >
            {" "}
            hr@qugo.io
          </a>
        </div>
      </div>
    </div>
  );
};

export default LastSection;
