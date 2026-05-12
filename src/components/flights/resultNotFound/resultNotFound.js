import { useState } from "react";
import Image from "next/image";
import style from "./styles.module.css";
import noresult from "../../../../public/img/noResult.png";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic';

const ResultNotFoundComponent = () => {
  const router = useRouter();
  const [routeLoading, setRouteLoading] = useState(false);
  const [activeLink, setActiveLink] = useState("flights");
  const handleLinkClick = (link) => {
    setRouteLoading(true);
    setActiveLink(link);
    router.push(link);
  };

  return (
    <div className={style.centered}>
      <Image
        src={noresult}
        className={style.imageResult}
        alt="noresult image"
      />

      <div>
        <span className={style.resultext}>No Flights found!</span>
        <div className={style.notfound}>
          The requested Flight could not be found.{" "}
        </div>
        <div className={style.notfound}>You can return to Homepage</div>
      </div>
      <div className={style.gotobutton} onClick={() => handleLinkClick("/")}>
        <span className={style.homepage}>Go To Home</span>
      </div>
    </div>
  );
};

const ResultNotFound = dynamic(() => Promise.resolve(ResultNotFoundComponent), {
  ssr: false,
  loading: () => <div>Loading...</div> // Optional loading state
});

export default ResultNotFound;
