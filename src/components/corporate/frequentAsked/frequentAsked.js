import styles from "./styles.module.css";
import { useState } from "react";
import Image from "next/image";
import Minuesicon from "../../../../public/img/corporate/minuesicon.png";
import Plusicon from "../../../../public/img/corporate/plusicon.png";
const Questionasked = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const handleViewMoreClick = () => {
    setIsPopupOpen(true);
  };
  const handleViewLessClick = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className={styles.entrie}>
      <div className={styles.designed}>
        <div className={styles.text1}>Have questions? We’re here to help.</div>
        <div className={styles.text2}>Frequently Asked Questions</div>
      </div>
      <div className={styles.videsplayer}>
        <div className={styles.askingsquestion}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Image
                src={Minuesicon}
                className={styles.Minuesicon}
                alt="minuesicon image"
              />
            </div>
          </div>
          <hr></hr>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <div className={styles.askingsquestion2}>
              How we will help to control and reduce your business travel costs?
            </div>
            <div>
              <Image
                src={Plusicon}
                className={styles.Plusicon}
                alt="minuesicon image"
              />
            </div>
          </div>
          <hr></hr>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <div className={styles.askingsquestion2}>
              Do we offer bespoke business solutions?
            </div>
            <div>
              <Image
                src={Plusicon}
                className={styles.Plusicon}
                alt="minuesicon image"
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            <button className={styles.viewbtn} onClick={handleViewMoreClick}>
              VIEW MORE
            </button>
          </div>
        </div>
      </div>
      {isPopupOpen && (
        <div className={styles.videsplayer}>
          <div className={styles.askingsquestionbtn}>
            <hr></hr>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <div className={styles.askingsquestion2}>
                Do we offer bespoke business solutions?
              </div>
              <div>
                <Image
                  src={Plusicon}
                  className={styles.Plusicon}
                  alt="minuesicon image"
                />
              </div>
            </div>
            <hr></hr>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <div className={styles.askingsquestion2}>
                Do we offer bespoke business solutions?
              </div>
              <div>
                <Image
                  src={Plusicon}
                  className={styles.Plusicon}
                  alt="minuesicon image"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <button className={styles.viewbtn} onClick={handleViewLessClick}>
                VIEW LESS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Questionasked;
