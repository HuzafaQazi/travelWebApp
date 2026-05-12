import React from "react";
import Image from "next/image";
import firstStay from "@/images/corporate/Rectangle 24411.png";

const Schedule = () => {
  return (
    <>
      <div className="mt-6 ">
        <div className="bg-[#E5E9EB] w-full h-full rounded-lg p-3 mt-2">
          <div className="flex bg-white rounded-3xl p-0">
            <div className="py-[14%] sm:py-[10%] px-[3%]">
              <div className="flex justify-center sm:justify-normal space-x-6 h-[15%] pl-[3%] font-semibold">
                <span className="animate-mice delay-0">M</span>
                <span className="animate-mice delay-200">.</span>
                <span className="animate-mice delay-400">I</span>
                <span className="animate-mice delay-600">.</span>
                <span className="animate-mice delay-800">C</span>
                <span className="animate-mice delay-1000">.</span>
                <span className="animate-mice delay-1200">E</span>
              </div>
              <div className="text-[#030F0CB2] text-sm sm:text-lg mt-4 sm:mt-auto font-medium">
                We will oversee every aspect of the planning and execution of a
                successful
                <br />
                <span className="text-[#030F0C] text-base sm:text-xl font-semibold">
                  Meeting, Incentives, Corporate and Events
                </span>
              </div>
            </div>
            <div className="ml-auto hidden sm:block">
              <Image src={firstStay} alt="hotelimage" className="h-fit" />
            </div>
          </div>
          <style jsx>{`
            @keyframes miceAnimation {
              0% {
                transform: scale(3);
                color: #000000;
              }
              50% {
                transform: scale(4);
                color: #028fa3;
              }
              100% {
                transform: scale(3);
                color: #000000;
              }
            }

            .animate-mice {
              animation: miceAnimation 2s infinite ease-in-out;
              display: inline-block;
            }

            /* Delay for individual letters */
            .delay-0 {
              animation-delay: 0s;
            }
            .delay-200 {
              animation-delay: 0.2s;
            }
            .delay-400 {
              animation-delay: 0.4s;
            }
            .delay-600 {
              animation-delay: 0.6s;
            }
            .delay-800 {
              animation-delay: 0.8s;
            }
            .delay-1000 {
              animation-delay: 1s;
            }
            .delay-1200 {
              animation-delay: 1.2s;
            }
          `}</style>
        </div>
      </div>
    </>
  );
};

export default Schedule;
