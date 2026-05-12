import Image from "next/image";
import { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import style from "./styles.module.css";

const HotelImageCarousel = (props) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const hotelPictures = props.hotelPictures || [];

  return (
    <Carousel activeIndex={activeIndex} onSelect={handleSelect}>
      {hotelPictures.map((picture, index) => (
        <Carousel.Item key={index}>
          <Image
            src={picture}
            alt={`Image ${index + 1}`}
            className={style.keenSliderImage1}
            layout="responsive" // Use layout="fill" to scale the images to fit the container
            width={400} // Set the width of the image
            height={225}
          />
          <Carousel.Caption></Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default HotelImageCarousel;
