import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";
import Link from "next/link";
import iata from "../../../public/img/IATA.png";
import brandLogo from "../../../public/img/brand_logo_white.png";
import { setTabSpecificData } from "@/utils/axios/axios";

export default function Footer() {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");

  const [isHomePage, setIsHomePage] = useState(false);

  useEffect(() => {
    // Check if running on the client
    if (typeof window !== "undefined") {
      setIsHomePage(window.location.pathname === "/CIT-95");
    }
  }, []);

  const handleSubscribeClick = () => {
    setShowEmailInput(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleLinkClick = (tabId) => {
    console.log("handlelinkclick: ", tabId);
    setTabSpecificData("activeTab", tabId);
  };

  const handleSubscribe = () => {
    setShowEmailInput(false);
  };
  return (
    <div
      className={
        isHomePage ? styles["footer-container1"] : styles["footer-container"]
      }
    >
      <footer className={styles.footer}>
        <div className={styles.column + " " + styles["logo-column"]}>
          <h3>About WeynGo</h3>
          <Image
            src={brandLogo}
            alt="Company Logo"
            className={styles.logo}
            width={300}
            height={300}
          />
          <p className={styles.poweredLine}>WeynGo Travels</p>
          <p className={styles["company-description"]}>
            WeynGo is revolutionising how you experience this beautiful planet.
            With our on ground expertise and cutting edge technology, we provide
            the right way to travel and explore the beauty that this earth
            bears.
          </p>
        </div>
        <div className={styles.column}>
          <h4 className={styles["column-heading"]}>Explore</h4>
          <ul className={styles["button-list"]}>
            <li>
              <a href="https://qugo.io/" target="_blank">
                About Us
              </a>
            </li>
            <li>
              <Link href="/" onClick={() => handleLinkClick("hotels")}>
                Hotels
              </Link>
            </li>
            {/* <li>
              <a href="#">Flights</a>
            </li>  */}
            <li>
              <Link href="/" onClick={() => handleLinkClick("flights")}>
                Flights
              </Link>
            </li>
            <li>
              <Link href="/" onClick={() => handleLinkClick("packages")}>
                Packages
              </Link>
            </li>
            <li>
              <Link href="/blogs" target="_blank">
                Blogs
              </Link>
            </li>
            {/* <li>
              <a href="#">Blog</a>
            </li> */}
          </ul>
        </div>
        <div className={styles.column}>
          <h4 className={styles["column-heading"]}>Policy</h4>
          <ul className={styles["button-list"]}>
            <li>
              <a
                target="_blank"
                href="/bookingtermsandconditions"
                className={styles["nounderline-text"]}
              >
                Terms & Conditions
              </a>
            </li>
            <li>
              <Link
                target="_blank"
                href="/bookingprivacypolicy"
                className={styles["nounderline-text"]}
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.column + " " + styles.social}>
          <h4 className={styles["column-heading"]}>Contact Us</h4>
          <div className={styles["contact-info"]}>
            <a href="tel:+971XXXXXXXXX">+971 XX XXX XXXX</a>
            <br />
            <a href="mailto:info@weyngo.io">info@weyngo.io</a>
            <br />
            <a>WeynGo Travel & Tourism LLC</a>
            <br />
            <a>Business Bay, Dubai</a>
            <br />
            <a>United Arab Emirates</a>
          </div>
          {/* <div className={styles["social-mobile"]}>
            <ul className={styles["icons-mobile"]}>
              <li>
                <a
                  href="https://www.instagram.com/qugotrips/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "white" }}
                >
                  <FontAwesomeIcon
                    icon={faInstagram}
                    style={{ maxHeight: "25px", height: "20px" }}
                    className={styles.socialiconsmob}
                  />
                </a>{" "}
              </li>
              <li>
                <a
                  href="https://www.facebook.com/qugotrips"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "white" }}
                >
                  <FontAwesomeIcon
                    icon={faFacebook}
                    style={{ maxHeight: "18px", height: "16px" }}
                  />
                </a>{" "}
              </li>
              <li>
                <a
                  href="https://twitter.com/QugoTrips"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "white" }}
                >
                  <FontAwesomeIcon
                    icon={faXTwitter}
                    style={{ maxHeight: "18px", height: "16px" }}
                  />
                </a>{" "}
              </li>
            </ul>
          </div>
          <div className={styles["social-icons"]}>
            <a
              href="https://www.instagram.com/qugotravel/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "white" }}
            >
              <FontAwesomeIcon
                icon={faInstagram}
                style={{ maxHeight: "25px", height: "25px" }}
              />
            </a>{" "}
            <a
              href="https://www.facebook.com/qugotravel"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "white" }}
            >
              <FontAwesomeIcon
                icon={faFacebook}
                style={{ maxHeight: "25px", height: "25px" }}
              />
            </a>{" "}
            <a
              href="https://www.linkedin.com/company/qugotrips/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "white" }}
            >
              <FontAwesomeIcon
                icon={faLinkedin}
                style={{ maxHeight: "25px", height: "25px" }}
              />
            </a>{" "}
          </div> */}
        </div>
        <div className={styles.column}>
          <h4 className={styles["column-heading"]}>Join Our Blog</h4>
          <a href="#">weyngoblog.com</a>
          {!showEmailInput ? (
            <div className={styles.subscribeButton}>
              <button onClick={handleSubscribeClick}>Subscribe</button>
            </div>
          ) : (
            <div className={styles.emailInput}>
              <input
                className={styles.emailinputplace}
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
              />
              <div className={styles.subscribeButton}>
                <button onClick={handleSubscribe}>Subscribe</button>
              </div>
            </div>
          )}
          <Image
            src={iata}
            alt="IATA Logo"
            className={styles.logo1}
            color="white"
            width={100}
            height={80}
            style={{ marginTop: "10px" }}
          />
        </div>
        <div className={styles["faq-mobile"]}>
          <center>{/* <h3>{"FAQ'S"}</h3> */}</center>
        </div>
      </footer>
      <div className={styles["endlogo-mobile"]}>
        <center>
          <Image src={brandLogo} alt="" width={80} height={40} />
        </center>
      </div>
    </div>
  );
}
