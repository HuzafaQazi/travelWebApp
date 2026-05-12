import styles from "./style.module.css";
import Image from "next/image";

const SixthPage = () => {
  const topAttractions = [
    {
      image: "/img/Group 241.png",
      link: "#",
    },
    {
      image: "/img/Group 242.png",
      link: "#",
    },
    {
      image: "/img/Group 243.png",
      link: "#",
    },
    {
      image: "/img/Group 241.png",
      link: "#",
    },
  ];

  return (
    <div className={styles["sixth-page"]}>
      <center>
        <h2>Bangkok Top Attractions</h2>
      </center>
      <center>
        <hr />
      </center>

      <div className={styles["top-cards"]}>
        {topAttractions.map((attraction, index) => (
          <div className={styles["card"]} key={index}>
            <a href={attraction.link}>
              <Image src={attraction.image} alt="" width={300} height={200} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SixthPage;
