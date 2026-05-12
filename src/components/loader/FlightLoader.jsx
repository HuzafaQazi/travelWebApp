import Image from "next/image";
import style from "./FlightLoader.module.css";
import loaderf from "../../../public/img/flightload.gif";

export default function FlightLoader({ isContentRequired = true }) {
  return (
    <div className={style.flightLoad}>
      <Image src={loaderf} alt="Loading..." className={style.planeLoader} />
      {isContentRequired && (
        <div className={style.loaderText}>
          Buckle up!
          <br />
          <span className={style.loaderText1}>
            {" "}
            Jet-setting deals are coming!
          </span>
        </div>
      )}
    </div>
  );
}
