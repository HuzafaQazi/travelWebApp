const QugoBenefits = () => {
  const benefits = [
    {
      icon: "📜",
      title: "Perfectly Sculpted Career Trajectories",
      color: "bg-[#983838]",
    },
    {
      icon: "⚡",
      title: "Phenomenal Pace, Flexibility & Agility",
      color: "bg-[#4e5b9c]",
    },
    {
      icon: "😊",
      title: "Purposeful Perks & Fun At Work",
      color: "bg-[#6b9c55]",
    },
    {
      icon: "💻",
      title: "Impressive Technology & Product Platforms",
      color: "bg-[#4da2db]",
    },
    {
      icon: "🤝",
      title: "Inclusive & Caring Culture",
      color: "bg-[#3791a0]",
    },
    {
      icon: "🏆",
      title: "Inspirational Leadership & Peer Set",
      color: "bg-[#64379e]",
    },
  ];

  return (
    <div className="p-8">
      {/* Section Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center  ">
          <div className="border-2 w-fit border-dashed rounded-xl border-[#028fa3] p-4 text-center">
            <h1 className="text-4xl font-bold text-black">With Us, You Get</h1>
          </div>
        </div>
        <p className="text-lg md:text-xl mt-4 text-gray-700 leading-relaxed w-[95%] mb-2 font-sans">
          With us, you get endless growth opportunities, innovation, and
          leadership. Experience a culture of inclusivity, flexibility, and
          purpose-driven success
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center p-6 text-white rounded-lg shadow-md ${benefit.color}`}
          >
            <div className="text-5xl mb-4">{benefit.icon}</div>
            <h3 className="text-center text-lg font-medium">{benefit.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QugoBenefits;
