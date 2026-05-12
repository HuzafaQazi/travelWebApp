import Image from "next/image";
import style from "./PackageLoader.module.css";
import hotelf from "../../../public/img/package.gif";

export default function PackageLoader() {
  return (
    <div className={style.flightLoad}>
      <Image src={hotelf} alt="Loading..." className={style.planeLoader} />
      <div className={style.loaderText}>
        Your vacation awaits!
        <br />
        <span className={style.loaderText1}>
          {" "}
          Curating the best itineraries and best prices for you!
        </span>
      </div>
    </div>
  );
}
