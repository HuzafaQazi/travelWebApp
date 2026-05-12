import Image from "next/image";
import first from "../../../../public/img/event/group1 (1).jpeg";
import secont from "../../../../public/img/event/group1 (2).jpeg";

export default function TwoPhotoGallery() {
  return (
    <div className="  p-4">
      <h2 className="text-xl font-semibold mb-4">Gallery</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative w-full h-[600px]">
          <Image
            src={first}
            alt="Gallery Image 1"
            fill
            style={{ objectFit: "cover" }}
            className="rounded-lg shadow-md"
          />
        </div>
        <div className="relative w-full h-[600px]">
          <Image
            src={secont}
            alt="Gallery Image 2"
            fill
            style={{ objectFit: "cover" }}
            className="rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
