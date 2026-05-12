
const WhyQugo = () => {
    const benefits = [
        { icon: "🏥", title: "Medical Coverage" },
        { icon: "👨‍💻🔄👨‍👩‍👧‍👦", title: "WorkLife Balance" },
        { icon: "👶", title: "Parental Benefits" },
        { icon: "💰", title: "Retirement Benefits" },
    ];

    return (
        <div className="px-8 py-0 text-center overflow-hidden">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-center  ">
                    <div className="border-2 w-fit border-dashed rounded-xl border-[#028fa3] p-4 text-center">
                        <h1 className="text-4xl font-bold text-black">
                            Why Qugo?
                        </h1>
                    </div>
                </div>

                <p className="text-lg md:text-xl text-gray-700 text-center leading-relaxed mx-auto py-3 w-[90%] mb-2 font-sans">At Qugo, we redefine possibilities through innovation, passion, and purpose. Heres why joining us is more than just a career move—its a transformative journey</p>
            </div>

            {/* Scrolling Benefits Section */}
            <div className="overflow-hidden w-full mx-auto md:w-[90%] flex justify-center items-center rounded-md">
                <div className="carousel-track flex w-[75%] gap-6 animate-scroll-left space-x-1">
                    {benefits.concat(benefits).map((benefit, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 w-[200px] h-[200px] bg-[#028fa3] p-6 mx-0 rounded-full shadow-md text-center flex flex-col items-center justify-center"
                        >
                            <div className="text-4xl mb-2">{benefit.icon}</div>
                            <h3 className="font-semibold text-lg text-white">
                                {benefit.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WhyQugo;
