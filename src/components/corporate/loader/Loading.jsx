import Vistara from "@/images/corporate/L.gif";
import Image from "next/image";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999999999999] bg-gray-900 bg-opacity-50">
      <Image
        src={Vistara}
        alt="Loading animation"
        className="w-[180px] h-[230px] z-[60]"
      />
    </div>
  );
};

export default Loading;
