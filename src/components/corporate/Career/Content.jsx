
const JourneyCommitment = () => {
  return (
    <div className=" pl-[5%] py-[4%] ">
      <div className="w-full mx-auto text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-teal-600 mb-6">
          Together, We Make It Happen
        </h2>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed w-[95%] mb-2 font-sans">
          At Qugo, we believe that every journey is as unique as the traveler. Our philosophy is rooted in growth—yours and ours. We empower you to explore your career path, backed by the right leadership, resources, and opportunities.
          Together, we create unforgettable travel experiences that inspire exploration, foster meaningful connections, and bring the world closer. Lets redefine the art of travel, together.
        </p>
        {/* Call to Action Button */}
        <button className="mt-6 px-8 mr-[5%] py-3 bg-teal-500 text-white text-lg font-semibold rounded hover:bg-teal-600 transition"
          onClick={() => window.open("https://hr-1.in/92b46c", "_blank")}
        >
          Explore Roles
        </button>
      </div>
    </div>
  );
};

export default JourneyCommitment;
