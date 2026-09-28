import React from "react";
import Image from "next/image";
import firstStay from "@/images/corporate/480.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const OfferAndRequest = () => {
  return (
    <>
      <div className="mt-3 mb-3">
        <div className="flex gap-3 ">
          <div className="text-[#1C1C1C] text-lg font-semibold">
            Offers & Updates
          </div>
          <div className="text-[#155EEF] text-lg font-medium cursor-pointer">
            View All{" "}
            <span>
              <FontAwesomeIcon icon={faChevronRight} className="h-4" />{" "}
            </span>
          </div>
        </div>

        <div className="bg-[#E5E9EB] w-full h-full rounded-lg p-2 mt-2 overflow-x-auto hide-scrollbar">
          <div className="flex gap-3 ">
            <div className="relative w-1/3 h-[370px] ">
              <Image src={firstStay} alt="hotelimage" className="h-[370px]" />
              <div className="absolute top-[80%] transform -translate-y-1/2 px-[10%] text-white text-normal">
                40% Off on business stays in Lemon Hotel
              </div>
            </div>

            <div className="relative w-1/3 h-[370px] ">
              <Image src={firstStay} alt="hotelimage" className="h-[370px]" />
              <div className="absolute top-[80%] transform -translate-y-1/2 px-[10%] text-white text-normal">
                Amazing International Corporate Tours Packages
              </div>
            </div>

            <div className="relative w-1/3 h-[370px]">
              <Image src={firstStay} alt="hotelimage" className="h-[370px]" />
              <div className="absolute top-[80%] transform -translate-y-1/2 px-[10%] text-white text-normal">
                MICE for your every small to big corporate event
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferAndRequest;
