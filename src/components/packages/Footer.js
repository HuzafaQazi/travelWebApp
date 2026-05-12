import styles from "./style.module.css";
import Image from "next/image";

const Footer = () => {
  return (
    <div className={styles["footer-container"]}>
      <footer className={styles.footer}>
        <div className={styles.column + " " + styles["logo-column"]}>
          <h3>About QuGo</h3>
          <Image
            src="/img/Qugo Logo white-01.png"
            alt="Company Logo"
            className={styles.logo}
            width={300}
            height={300}
          />
          <p className={styles["company-description"]}>
            QuGo provides the best deals, customized tour packages, and more
            from the best travel agency in Bangalore. Thinking of travel? QuGo
            provides the best deals, customized tour packages, and more from the
            best deals, customized tour packages, and more from the
          </p>
        </div>
        <div className={styles.column}>
          <h4 className={styles["column-heading"]}>Explore</h4>
          <ul className={styles["button-list"]}>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Hotels</a>
            </li>
            <li>
              <a href="#">Flights</a>
            </li>
            <li>
              <a href="#">Packages</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
          </ul>
        </div>
        <div className={styles.column}>
          <h4 className={styles["column-heading"]}>Policy</h4>
          <ul className={styles["button-list"]}>
            <li>
              <a href="#">Terms & Conditions </a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Cookie Policy</a>
            </li>
            <li>
              <a href="#">Terms of Use</a>
            </li>
            <li>
              <a href="#">Help</a>
            </li>
          </ul>
        </div>
        <div className={styles.column + " " + styles.social}>
          <h4 className={styles["column-heading"]}>Contact Us</h4>
          <p className={styles["contact-info"]}>
            7204186969
            <br />
            info@qugo.io
          </p>
          <div className={styles["social-mobile"]}>
            <ul className={styles["icons-mobile"]}>
              <li>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fab fa-facebook"></i>
                </a>
              </li>
            </ul>
          </div>
          <div className={styles["social-icons"]}>
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#">
              <i className="fab fa-discord"></i>
            </a>
            <a href="#">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
        <div className={styles.column}>
          <h4 className={styles["column-heading"]}>Join Our Blog</h4>
          <a href="#">qugoblog.com</a>
          <button className={styles["subscribe-button"]}>Subscribe</button>
        </div>
        <div className={styles["join-mobile"]}>
          <input type="text" placeholder="E-mail" />
          <button>Join Now</button>
        </div>
        <div className={styles["faq-mobile"]}>
          <center>
            <h3>{"FAQ'S"}</h3>
          </center>
        </div>
        <div className={styles["contacts-mobile"]}>
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
        </div>

        <div className={styles["end-mobile"]}>
          <span className={styles["text-end"]}>2023 All Rights Reserved</span>
          <span className={styles["text-end"]}>Terms & Conditions</span>
          <span className={styles["text-end"]}>Privacy & policy</span>
        </div>
      </footer>
      <div className={styles["endlogo-mobile"]}>
        <center>
          <Image
            src="/img/qugo-footer-logo-mobile.png"
            alt=""
            width={90}
            height={40}
          />
        </center>
      </div>
      <div className={styles.row}>
        <div id={styles["st-box"]}>
          <p>2023 All Rights Reserved</p>
        </div>
        <div id={styles["nd-box"]}>
          <p>Terms & Conditions</p>
        </div>
        <div id={styles["rd-box"]}>
          <p>Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
