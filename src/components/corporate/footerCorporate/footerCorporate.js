import { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import Footerimg from "../../../../public/img/corporate/footerimg.png";
import Image from "next/image";
import Link from "next/link";
import iata from "../../../../public/img/IATA.png";

export default function Footer1() {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribeClick = () => {
    setShowEmailInput(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubscribe = () => {
    // Add your logic to subscribe the user here, using the 'email' state
    console.log(`Subscribing user with email: ${email}`);
    // You can make an API call to subscribe the user, etc.

    // After subscribing, you can hide the email input field
    setShowEmailInput(false);
  };
  return (
    <div className={styles["footer-container"]}>
      <footer className={styles.footer}>
        <div className={styles.column + " " + styles["logo-column"]}>
          <h3>About QuGo</h3>
          <Image src={Footerimg} alt="Company Logo" className={styles.logo} />
          <p className={styles.poweredLine}>
            Qugo Travel Technologies Pvt. Ltd.
          </p>
          <p className={styles["company-description"]}>
            QuGo .Corporate manages business travel to
            <br />
            ensure a smooth experience. It handles <br />
            everything from employee onboarding to
            <br />
            reserving and managing your travel
            <br />
            expenses.
          </p>
        </div>
        <div className={styles.column}>
          <h4 className={styles["column-heading"]}>About</h4>
          <ul className={styles["button-list"]}>
            <li>
              <a href="/corporate/aboutpage" target="_blank">
                About Us
              </a>
            </li>
            <li>
              <a href="/corporate/solution" target="_blank">
                Solutions
              </a>
            </li>
            {
              <li>
                <Link href="/blogs" target="_blank">
                  Blogs
                </Link>
              </li>
            }
            <li>
              <Link href="/corporate/Careers" target="_blank">
                Careers
              </Link>
            </li>
            {/* <li>
              <Link href="/">Hotels</Link>
            </li> */}
            {/* <li>
              <a href="#">Flights</a>
            </li>  */}
            {/* <li>
              <Link href="/flights">Flights</Link>
            </li> */}
            {/* <li>
              <Link href="/packages">Packages</Link>
            </li> */}
            {/* <li>
              <a href="#">Blog</a>
            </li> */}
          </ul>
        </div>
        <div className={styles.column}>
          <h4 className={styles["column-heading"]}>Policy</h4>
          <ul className={styles["button-list"]}>
            {/* <li>
              <Link
                target="_blank"
                href="/bookingtermsandconditions"
                className={styles["nounderline-text"]}
              >
                Terms & Conditions
              </Link>
            </li> */}
            {/* <li>
              <Link
                target="_blank"
                href="/bookingtermsandconditions"
                className={styles["nounderline-text"]}
              >
                Cookie policy 
              </Link>
            </li> */}
            <li>
              <Link
                target="_blank"
                href="/bookingtermsandconditions"
                className={styles["nounderline-text"]}
              >
                Terms of use
              </Link>
            </li>
            {/* <li>
              <Link
                target="_blank"
                href="/bookingtermsandconditions"
                className={styles["nounderline-text"]}
              >
                Help
              </Link>
            </li> */}

            <li>
              <Link
                target="_blank"
                href="/bookingprivacypolicy"
                className={styles["nounderline-text"]}
              >
                Privacy Policy
              </Link>
            </li>

            {/* <li>
              <a href="#">Cookie Policy</a>
            </li>
            <li>
              <a href="#">Terms of Use</a>
            </li>
            <li>
              <a href="#">Help</a>
            </li> */}
          </ul>
        </div>
        <div className={styles.column + " " + styles.social}>
          <h4 className={styles["column-heading"]}>Get in touch!</h4>
          <div className={styles["contact-info"]}>
            <a href="tel:+917204186969">+917204186969</a>
            <br />
            <a href="mailto:info@qugo.io">info@qugo.io</a>
          </div>
          <div className={styles["social-mobile"]}>
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
              {/* <li>
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
              </li> */}
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
                style={{ maxHeight: "18px", height: "16px" }}
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
                style={{ maxHeight: "18px", height: "16px" }}
              />
            </a>{" "}
            {/* <a
              href="https://twitter.com/QugoTrips"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "white" }}
            >
              <FontAwesomeIcon
                icon={faXTwitter}
                style={{ maxHeight: "18px", height: "16px" }}
              />
            </a>{" "} */}
            <a
              href="https://www.linkedin.com/company/qugotrips/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "white" }}
            >
              <FontAwesomeIcon
                icon={faLinkedin}
                style={{ maxHeight: "18px", height: "16px" }}
              />
            </a>{" "}
            {/* <a
              href="https://www.youtube.com/@qugotrips/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "white" }}
            >
              <FontAwesomeIcon
                icon={faYoutube}
                style={{ maxHeight: "18px", height: "16px" }}
              />
            </a> */}
          </div>
          <Image
            src={iata}
            alt="IATA Logo"
            className={styles.logo1}
            color="white"
            width={100}
            height={80}
            style={{ marginTop: "10px" }}
          />
          {/* <div className={styles.maincontainer}>
          <div style={{display:"flex"}}>
          <span className={styles.demo}>Send request for demo</span>
          </div>
          <div style={{display:"flex"}}>
          <input type="text" placeholder="Enter your email Id" className={styles.emailid}></input>
          <input type="text" className={styles.demos1} placeholder="Demo"></input>
          </div>
          </div>
         */}
        </div>

        {/* <div className={styles.column}>
          <h4 className={styles["column-heading"]}>Join Our Blog</h4>
          
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
        </div> */}
        <div className={styles["join-mobile"]}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
          />
          <div className={styles.subscribeButton}>
            <button onClick={handleSubscribe}>Subscribe</button>
          </div>
        </div>
        <div className={styles["faq-mobile"]}>
          <center>{/* <h3>{"FAQ'S"}</h3> */}</center>
        </div>
        {/* <div className={styles["contacts-mobile"]}>
          <div className={styles["contact-1"]}>
            <span className={styles.icon}>&#9993;</span>
            <span className={styles.text}>info@qugo.io</span>
          </div>
          <div className={styles["contact-1"]}>
            <span className={styles.icon}>&#9742;</span>
            <span className={styles.text}>+91-7204186969</span>
          </div>
          <div className={styles["contact-1"]}>
            <span className={styles.icon}>&#127760;</span>
            <span className={styles.text}>www.qugo.in</span>
          </div>
        </div> */}

        {/* <div className={styles["end-mobile"]}>
          <span className={styles["text-end"]}>2023 All Rights Reserved</span>
          <span className={styles["text-end"]}>Terms & Conditions</span>
          <span className={styles["text-end"]}>Privacy & policy</span>
        </div> */}
      </footer>
      <div className={styles["endlogo-mobile"]}>
        <center>
          {/* <Image
            src="/img/qugo-footer-logo-mobile.png"
            alt=""
            width={80}
            height={40}
          /> */}
        </center>
      </div>
      {/* <div className={styles.row}>
        <div id={styles["st-box"]}>
          <p>2023 All Rights Reserved</p>
        </div>
        <div id={styles["nd-box"]}>
          <p>Terms & Conditions</p>
        </div>
        <div id={styles["rd-box"]}>
          <p>Privacy Policy</p>
        </div>
      </div> */}
    </div>
  );
}

// <div className={style.footer}>
//   <div className={style["container"]}>
//     <div className="row">
//       <div className="col-lg-4 align-items-stretch">
//         <div className={`row ${style.footerData}`}>
//           <div className="col-lg-10 align-items-start">
//             <div className={style.offers}>
//               <div
//                 className={`d-flex align-items-start ${style.logoContainer}`}
//               >
//                 <Image
//                   className={style.qugoLogo}
//                   src={qugologo}
//                   alt="Qugo Logo"
//                 />
//               </div>
//               <p>Powered by Quinta Systems Pvt. Ltd.</p>
{
  /* <p>
                    QuGo provides the best deals, customized tour packages, and
                    more from the best travel agency in Bangalore. Thinking of
                    travel? QuGo provides the best deals, customized tour
                    packages, and more from the best deals, customized tour
                    packages, and more from the{" "}
                  </p> */
}
{
  /* <p>
                    QuGo is revolutionising how you experience this beautiful
                    planet. With our on ground expertise and cutting edge
                    technology, we provide the right way to travel and explore
                    the beauty that this earth bears.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4 align-items-stretch">
            <div className={`row ${style.footerData}`}>
              <div className="col-lg-6 align-items-stretch">
                <div className={style.offers}>
                  <h5>Explore</h5>
                  <p>
                    <a href="https://qugo.io/" target="_blank">
                      About us
                    </a>
                  </p>
                  <p>
                    <Link href="/">Hotels</Link>
                  </p>
                </div>
              </div>
              <div className="col-lg-6 align-items-stretch">
                <div className={style.policy}>
                  <h5>Policy</h5>
                  <div>
                    <p>
                      <Link
                        target="_blank"
                        href="/bookingtermsandconditions"
                        className={style["nounderline-text"]}
                      >
                        Terms & Conditions
                      </Link>
                    </p>
                    <p>
                      <Link
                        target="_blank"
                        href="/bookingprivacypolicy"
                        className={style["nounderline-text"]}
                      >
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`col-lg-4 align-items-stretch  ${style.contactDetails}`}
          >
            <div className={`row ${style.footerData}`}>
              <div className="col-lg-6 align-items-stretch">
                <div className={style.policy}>
                  <h5>Contact us!</h5>
                  <a href="tel:+917204186969">
                    <p>+91 7204186969</p>
                  </a>
                  <a href="mailto:info@qugo.io">
                    <p>info@qugo.io</p>
                  </a>
                  <p>
                    <a
                      href="https://www.instagram.com/qugotrips/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "white" }}
                    >
                      <FontAwesomeIcon
                        icon={faInstagram}
                        style={{ maxHeight: "18px" }}
                      />
                    </a>{" "}
                    <a
                      href="https://www.facebook.com/qugotrips"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "white" }}
                    >
                      <FontAwesomeIcon
                        icon={faFacebook}
                        style={{ maxHeight: "18px" }}
                      />
                    </a>{" "}
                    <a
                      href="https://twitter.com/QugoTrips"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "white" }}
                    >
                      <FontAwesomeIcon
                        icon={faXTwitter}
                        style={{ maxHeight: "18px" }}
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
                        style={{ maxHeight: "18px" }}
                      />
                    </a>{" "}
                    <a
                      href="https://www.youtube.com/@qugotrips/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "white" }}
                    >
                      <FontAwesomeIcon
                        icon={faYoutube}
                        style={{ maxHeight: "18px" }}
                      />
                    </a>
                  </p>
                </div>
              </div>
              <div className={`col-lg-4 align-items-stretch ${style.joinline}`}>
                <div className={style.blog}>
                  <h5>Join our blog</h5> */
}
{
  /* <a href="#">qugoblog.com</a> */
}
{
  /* </div>
                {!showEmailInput ? (
                  <div className={style.subscribeButton}>
                    <button onClick={handleSubscribeClick}>Subscribe</button>
                  </div>
                ) : (
                  <div className={style.emailInput}>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                    />
                    <div className={style.subscribeButton}>
                      <button onClick={handleSubscribe}>Subscribe</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div> */
}
// </div>
