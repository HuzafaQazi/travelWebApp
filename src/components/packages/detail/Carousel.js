import { useRef, useState } from "react";
import styles from "./style.module.css";

const Carousel = ({ children }) => {
  const carouselRef = useRef(null);
  const [isDragStart, setDragStart] = useState(false);
  const [prevPageX, setPrevPageX] = useState(0);
  const [prevScrollLeft, setPrevScrollLeft] = useState(0);

  const firstImgWidth = 320; // Adjust the value according to your requirements

  const handleArrowClick = (direction) => {
    carouselRef.current.scrollLeft +=
      direction === "left" ? -firstImgWidth : firstImgWidth;
  };

  const handleDragStart = (e) => {
    setDragStart(true);
    setPrevPageX(e.pageX);
    setPrevScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleDragging = (e) => {
    if (!isDragStart) return;
    e.preventDefault();
    let positionDiff = e.pageX - prevPageX;
    carouselRef.current.scrollLeft = prevScrollLeft - positionDiff;
  };

  const handleDragStop = () => {
    setDragStart(false);
  };

  return (
    <div className={styles["wrapper"]}>
      <i
        id="left"
        className="fa-solid fa-angle-left"
        onClick={() => handleArrowClick("left")}
      ></i>
      <div
        className={styles.carousel}
        ref={carouselRef}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragging}
        onMouseUp={handleDragStop}
        onMouseLeave={handleDragStop}
      >
        {children}
      </div>
      <i
        id="right"
        className="fa-solid fa-angle-right"
        onClick={() => handleArrowClick("right")}
      ></i>
    </div>
  );
};

export default Carousel;
