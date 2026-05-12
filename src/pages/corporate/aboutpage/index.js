import styles from "./styles.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import Bg2 from "../../../../public/img/corporate/aboutGpt/Bg2.png";
import Bg3 from "../../../../public/img/corporate/aboutGpt/Bg3.png";
import Bg1 from "../../../../public/img/corporate/Rectangle 2248.png";
import Component from "../../../../public/img/corporate/aboutGpt/Component.png";
import Header from "@/components/corporate/auth/Header";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import second from "../../../../public/img/corporate/1 6.png";
import third from "../../../../public/img/corporate/2 3.png";
import first from "../../../../public/img/corporate/aboutGpt/Bg.png";
import Head from "next/head";

export default function AboutPage() {
  const [firstWidth, setFirstWidth] = useState(400);
  const [secondWidth, setSecondWidth] = useState(150);
  const [thirdWidth, setThirdWidth] = useState(150);

  useEffect(() => {
    const animateImages = () => {
      setFirstWidth(400);
      setTimeout(() => {
        setFirstWidth(150);
      }, 500);

      setTimeout(() => {
        setThirdWidth(400);
      }, 2500);

      setTimeout(() => {
        setThirdWidth(150);
      }, 3000);

      setTimeout(() => {
        setSecondWidth(400);
      }, 5000);

      setTimeout(() => {
        setSecondWidth(150);
      }, 5500);
    };

    animateImages();

    const interval = setInterval(() => {
      animateImages();
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Head>
        <title>About Us</title>
      </Head>
      <div className="w-full h-full bg-[#FFFFFF]">
        <Header />
      </div>
      <section className={styles.hero}>
        <div className={styles.text1}>
          <div>
            Welcome to the new age of <br />
            <span className={styles.text}>Corporate Travel</span>
          </div>
          <div className={styles.text3}>
            QuGo, driven by advanced AI technology, <br />
            is revolutionizing the travel industry.
          </div>
          <button className={styles.getStarted}>Get Started</button>
        </div>

        <div className={styles.imageContainer}>
          <div className={styles.imageWrapper}>
            <Image
              src={first}
              alt="First Image"
              width={firstWidth}
              className="h-[400px]"
            />
            <Image
              src={second}
              alt="Third Image"
              width={thirdWidth}
              className="h-[400px]"
            />
            <Image
              src={third}
              alt="Second Image"
              width={secondWidth}
              className="h-[400px]"
            />
          </div>
        </div>
      </section>

      {/* // const Features = () => ( */}
      <section className={styles.features}>
        <h2>
          QuGo. Corporate <br /> ALL - IN ONE
        </h2>
        <p>
          QuGo, driven by advanced AI technology, is revolutionizing the <br />{" "}
          travel industry.
        </p>
        <div className={styles.cards}>
          <div className={styles.card}>
            <Image src={Bg2} alt="Corporate Travel" />
            <h3>
              Corporate <br /> Travel
            </h3>
            <p>We lead the charge in corporate travel!</p>
          </div>
          <div className={styles.card1}>
            <Image src={Bg1} alt="B2B Travel Agent" />
            <h3>
              B2B <br /> Travel Agent
            </h3>
            <p>We lead the charge in corporate travel!</p>
          </div>
          <div className={styles.card2}>
            <Image src={Bg3} alt="MICE Mastery" />
            <h3>
              M.I.C.E <br /> Mastery
            </h3>
            <p>We lead the charge in corporate travel!</p>
          </div>
        </div>
      </section>

      <section className={styles.corporateWorld}>
        <div className={styles.imageContainer}>
          <Image src={Component} alt="Cityscape" className={styles.image} />
          <div className={styles.overlayText}>
            <h2>
              All about <br /> corporate world!
            </h2>
          </div>
        </div>
        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>AI-driven technology</h3>
            <p>End-to-end trip handling and dynamic policy enforcement.</p>
          </div>
          <div className={styles.feature}>
            <h3>Well-planned events</h3>
            <p>End-to-end trip handling and dynamic policy enforcement.</p>
          </div>
          <div className={styles.feature}>
            <h3>AI-driven technology</h3>
            <p>End-to-end trip handling and dynamic policy enforcement.</p>
          </div>
        </div>
      </section>
      <Footer1 />
    </div>
  );
}
