import { useRef } from "react";
import styles from "./style.module.css";

const VerticalSlides = ({ children }) => {
  const verticalSlidesRef = useRef(null);
  let startOffset = 0;

  const handleScroll = () => {
  };

  return (
    <div
      className={styles["vertical-slides"]}
      ref={verticalSlidesRef}
      onScroll={handleScroll}
    >
      {children}
    </div>
  );
};

export default VerticalSlides;
