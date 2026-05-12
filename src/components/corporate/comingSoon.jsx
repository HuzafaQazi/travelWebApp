import Image from "next/image";
import companyLogo from "@/images/corporate/Final Coming Soon.png";

const ComingSoon = () => {
  return (
    <>
      <div className="flex flex-col items-center ">
        <div className="relative w-full h-[700px]">
          <Image
            src={companyLogo}
            alt="Example"
            layout="fill"
            objectFit="cover"
            className="rounded-lg "
          />
        </div>
      </div>
    </>
  );
};

export default ComingSoon;
