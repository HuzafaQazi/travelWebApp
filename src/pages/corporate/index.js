import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./styles.module.css";
import Footer from "@/components/corporate/footerCorporate/footerCorporate";
import Image from "next/image";
import Scanimg from "../../../public/img/corporate/scanimg.png";
import Imformationimg from "../../../public/img/corporate/imformationimg.png";
import carouselb from "../../images/corporate/Deparmtents created 1.png";
import carouselb1 from "../../images/corporate/Employees ADDED 1.png";
import carousels1 from "../../images/corporate/Travel policy - Flight 1.png";
import images from "../../images/Shadow.png";
import flight from "../../images/corporate/material-symbols_flightsmode.png";

import video from "../../images/corporate/video corporate new 1.mp4";
import images1 from "../../images/Shadow (1).png";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import Header from "@/components/corporate/auth/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Head from "next/head";

export default function Home() {
  const router = useRouter();

  const isUserLoggedIn = useSelector((state) => state?.user?.isLoggedIn);

  const [firstWidth, setFirstWidth] = useState(600);
  const [secondWidth, setSecondWidth] = useState(100);
  const [thirdWidth, setThirdWidth] = useState(100);

  useEffect(() => {
    const animateImages = () => {
      setFirstWidth(600);
      setTimeout(() => {
        setFirstWidth(100);
      }, 500);

      setTimeout(() => {
        setThirdWidth(600);
      }, 2500);

      setTimeout(() => {
        setThirdWidth(100);
      }, 3000);

      setTimeout(() => {
        setSecondWidth(600);
      }, 5000);

      setTimeout(() => {
        setSecondWidth(100);
      }, 5500);
    };

    animateImages();

    const interval = setInterval(() => {
      animateImages();
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageWidths, setImageWidths] = useState([100, 50, 50]); // initial widths

  const handleOpenLoginModal = async () => {
    if (isUserLoggedIn) {
      await router.push("/corporate/auth/company");
    } else {
      await router.push("/corporate/loginPage/Login");
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      // update widths every 3 seconds
      setImageWidths((prevWidths) => {
        const newWidths = [...prevWidths];
        newWidths[activeIndex] = 100; // enlarge active image
        newWidths[(activeIndex + 1) % 3] = 50; // collapse next image
        return newWidths;
      });
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3); // move to next image
    }, 3000);
    return () => clearInterval(intervalId);
  }, [activeIndex]);

  return (
    <>
      <Head>
        <title>Homepage</title>
      </Head>
      <div style={{ backgroundColor: "#E5E1E2" }}>
        <div className="bg-[#333] bg-gradie bg-custom-gradient">
          <div className="w-full h-full bg-[#FFFFFF]">
            <Header />
          </div>

          <div className="w-full h-96 flex p-10">
            <div className="flex flex-col justify-end w-full items-center sm:items-start sm:w-1/2 pl-0 sm:pl-10">
              <span className="text-lg font-light text-[#D5b300] mb-3">
                WeynGo.Corporate for Business Travel
              </span>
              <span className="text-3xl text-nowrap sm:text-4xl font-extralight text-white mb-2">
                Easy . Quick . Managed
              </span>
              <span className="text-4xl font-semibold text-white">
                Corporate Travel
              </span>
            </div>
            <div className="hidden sm:block">
              <div className="flex relative overflow-hidden">
                <div className={styles.imageContainer}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={carouselb}
                      alt="First Image"
                      width={firstWidth}
                      className="h-[300px]"
                    />
                    <Image
                      src={carouselb1}
                      alt="Third Image"
                      width={thirdWidth}
                      className="h-[300px]"
                    />
                    <Image
                      src={carousels1}
                      alt="Second Image"
                      width={secondWidth}
                      className="h-[300px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.coropatetravel}>
            <div className={styles.Stared} onClick={handleOpenLoginModal}>
              <button className={styles.button1}>
                <span>GET STARTED</span>
              </button>
              <div className={styles.flexbox}>
                <div>
                  <div className={styles.admin}>Admin</div>
                  <div className={styles.supervises}>
                    Who supervises the travel
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className={styles.righticon}
                />
              </div>
            </div>

            <div className={styles.Stared}>
              <button className={styles.button1}>
                <span>GET STARTED</span>
              </button>
              <div className={styles.flexbox}>
                <div>
                  <div className={styles.admin}>Employee</div>
                  <div className={styles.supervises}>
                    Who travel for business
                  </div>
                </div>
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className={styles.righticon}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.designed}>
          <div className={styles.text1}>Designed with the entire</div>
          <div className={styles.text2}>Organization in mind</div>
        </div>

        <div className={styles.coropatetravel1}>
          <div className={styles.Stared1}>
            <button className={styles.button1}>ADMIN</button>
            <div className={styles.admin1}>Who supervises the travel</div>
            <div className={styles.maintravel}>
              <span className={styles.supervisestravel}>
                <Image
                  src={flight}
                  alt="laptop Logo"
                  width={23}
                  className="h-[18px] w-[18px] sm:w-[23px] sm:h-[23px] mr-2"
                />
                Get privileges to set up the organization easily so that there
                is an smooth and systematic process{" "}
              </span>
              <span className={styles.supervisestravel}>
                <Image
                  src={flight}
                  alt="laptop Logo"
                  width={23}
                  className="h-[18px] w-[18px] sm:w-[23px] sm:h-[23px] mr-2"
                />
                Get access easily without cumbersome process{" "}
              </span>
              <span className={styles.supervisestravel}>
                <Image
                  src={flight}
                  alt="laptop Logo"
                  width={23}
                  className="h-[18px] w-[18px] sm:w-[23px] sm:h-[23px] mr-2"
                />
                Get access easily without cumbersome process{" "}
              </span>
            </div>
            <Image
              src={images1}
              alt="laptop Logo"
              className={styles.laptopimg1}
            />
          </div>
          <div className={styles.Stared1}>
            <button className={styles.button1}>
              <span>EMPLOYEE</span>
            </button>
            <div className={styles.admin1}>Who travel for business</div>
            <div className={styles.maintravel}>
              <span className={styles.supervisestravel}>
                <Image
                  src={flight}
                  alt="laptop Logo"
                  width={23}
                  className="h-[18px] w-[18px] sm:w-[23px] sm:h-[23px] mr-2"
                />
                Top-Rated hotels with safety surety{" "}
              </span>
              <span className={styles.supervisestravel}>
                <Image
                  src={flight}
                  alt="laptop Logo"
                  width={23}
                  className="h-[18px] w-[18px] sm:w-[23px] sm:h-[23px] mr-2"
                />
                Corporate fares which helps for budget{" "}
              </span>
              <span className={styles.supervisestravel}>
                <Image
                  src={flight}
                  alt="laptop Logo"
                  width={23}
                  className="h-[18px] w-[18px] sm:w-[23px] sm:h-[23px] mr-2"
                />
                Use wallet for the payment to easy proceed with payment{" "}
              </span>
            </div>
            <Image
              src={images}
              alt="laptop Logo"
              className={styles.laptopimg}
            />
          </div>
        </div>
        {/* { Simplified and easy Corporate travel} */}
        <div className={styles.designed}>
          <div className={styles.text1}> Simplified and easy </div>
          <div className={styles.text2}>Corporate travel </div>
        </div>
        <div className={styles.videsplayer}>
          <div className={styles.videsplayer1}>
            <video
              playsInline
              controls
              className="w-full h-auto rounded-2xl"
              autoPlay
              loop
              muted
            >
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* </div> */}
          </div>
        </div>
        {/* { Seamless Access from Everywhere} */}
        <div className={styles.designed}>
          <div className={styles.text1}> Seamless Access from </div>
          <div className={styles.text2}>Everywhere </div>
        </div>
        <div className={styles.videsplayer}>
          <div className={styles.insidemangement}>
            <Image
              src={Imformationimg}
              className={styles.informationimg}
              alt="imformation image"
            />
            <div
              style={{
                display: "flex",
                gap: "9%",
                flexDirection: "column",
                marginTop: "10px",
              }}
            >
              <div>
                <div className={styles.via}>Connect via mobile</div>
                <div className={styles.imgsupervises}>
                  Who supervises the travel
                </div>
              </div>
              <div>
                <Image
                  src={Scanimg}
                  className={styles.Scanimg}
                  alt="Scanimgs image"
                />
              </div>
            </div>
          </div>
        </div>
        {/* { Easy and quick Expense Management} */}
        <div className={styles.designed}>
          <div className={styles.text1}> Easy and quick </div>
          <div className={styles.text2}>Travel Management </div>
        </div>
        <div className={styles.videsplayer}>
          <div className={styles.insidemangement}>
            <div className={styles.finances}>
              Tired of overspending on business finances?
              <div className={styles.trustworthy}>
                Do you want a trustworthy partner to handle your finances?
              </div>
            </div>
            <div>
              <div className={styles.money}>
                QuGo.<span style={{ color: "#028FA3" }}> Corporate</span> saves
                time & money, and on business travel
              </div>
              <button className={styles.management}>TRAVEL MANAGMEENT</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
