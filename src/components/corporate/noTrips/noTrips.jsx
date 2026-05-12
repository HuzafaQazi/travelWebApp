import Image from "next/image";
import noTrips from "../../../../public/img/NoTrips.png";

const NoTrips = () => {
  return (
    <div className="flex items-center justify-center z-50 bg-opacity-50">
      <Image src={noTrips} alt="noTrips" className=" w-[300px] h-60 sm:w-[400px] sm:h-80" />
    </div>
  );
};

export default NoTrips;
