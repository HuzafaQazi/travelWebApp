import Image from "next/image";
import "tailwindcss/tailwind.css";
import map from "../../../../public/img/event/image.jpeg";
import second from "../../../../public/img/event/1.webp";

const HotelCard = () => {
  return (
    <div className="max-w-sm bg-white h-fit rounded-lg shadow-lg m-2 overflow-hidden border border-gray-200">
      {/* Hotel Image */}
      <div className="relative">
        <Image
          src={second} // Replace with actual image path
          alt="Radisson Blu Hotel Coimbatore"
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Hotel Details */}
      <div className="p-4">
        <h2 className="text-lg font-semibold">Radisson Blu Hotel Coimbatore</h2>

        {/* Address */}
        <p className="text-sm text-gray-700 mt-2">
          No. 164-165, Avinashi Road, Coimbatore, 641004, India
        </p>

        {/* Contact */}
        <div className="flex items-center gap-2 text-blue-600 mt-2">
          <span>📞 +91 422 316 6000</span>
        </div>
      </div>

      {/* Map Section */}
      <div className=" border-t border-gray-200">
        <Image
          src={map} // Replace with actual map image
          alt="Hotel Location"
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
      </div>
    </div>
  );
};

export default HotelCard;
