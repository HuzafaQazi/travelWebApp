import { useState } from "react";
import Image from "next/image"; // Adjust the import according to your setup
import noresult from "../../../../../public/img/NoResultsFound.png"; // Adjust the import according to your setup
import { useRouter } from "next/router";

const NoFlights = () => {
  const router = useRouter();
  const [routeLoading, setRouteLoading] = useState(false);
  const [activeLink, setActiveLink] = useState("flights");
  const handleLinkClick = (link) => {
    setRouteLoading(true);
    setActiveLink(link);
    router.push(link);
  };

  return (
    <div className="flex flex-col justify-center items-center h-[75vh] md:h-[95vh]">
      <Image
        src={noresult}
        className="w-[55%] md:w-[24%] h-auto"
        alt="noresult image"
      />

      <div className="text-center">
        <span className="font-roboto text-[41px] font-medium leading-[50px] text-[#878786] px-1">
          No Flights found!
        </span>
        <div className="font-roboto text-[16px] leading-[20px] text-[#878786]">
          The requested Flight could not be found.
        </div>
        <div className="font-roboto text-[16px] leading-[20px] text-[#878786]">
          You can return to Homepage
        </div>
      </div>
      <div
        className="mt-[40px] px-3 py-[0.7%] rounded-[15px] bg-[#155EEF] shadow-[0px_4px_4px_#231F2059] cursor-pointer"
        onClick={() => handleLinkClick("/")}
      >
        <span className="font-roboto text-[20px] font-medium leading-[47px] text-white">
          Go To Home
        </span>
      </div>
    </div>
  );
};

export default NoFlights;
