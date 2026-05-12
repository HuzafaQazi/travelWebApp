// components/CarouselSlide.js
import Image from "next/image";

const CarouselSlide = ({ imageUrl }) => {
  return <Image src={imageUrl} alt="Slide" width={300} height={390} />;
};

export default CarouselSlide;
