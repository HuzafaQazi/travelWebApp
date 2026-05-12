import styles from "./style.module.css";
import Image from "next/image";

const FifthPage = ({ policyRef, package_policy }) => {
  return (
    package_policy.length > 0 && (
      <div className={styles["fifth-page"]} id="policy" ref={policyRef}>
        <center>
          <h2 className={styles.policyHeadFont}>QuGo Policies</h2>
        </center>
        <center>
          <hr />
        </center>
        <div className={styles["policies"]}>
          <div className={styles["left-policy"]}>
            {package_policy.slice(0, 2).map((policy, index) => (
              <div key={index}>
                <div className={styles.policyIconName}>
                  <Image
                    src={policy.icon}
                    alt="icon"
                    className={styles["policy-icon"]}
                    width={100}
                    height={100}
                  />
                  <div className={styles.policyTitle}>{policy.title}</div>
                </div>
                <div
                  className={styles["points"]}
                  dangerouslySetInnerHTML={{ __html: policy.description }}
                ></div>
              </div>
            ))}
          </div>
          <div className={styles["right-policy"]}>
            {package_policy.slice(2, 4).map((policy, index) => (
              <div key={index}>
                <div className={styles.policyIconName}>
                  <Image
                    src={policy.icon}
                    alt="icon"
                    className={styles["policy-icon"]}
                    width={150}
                    height={150}
                  />
                  <div className={styles.policyTitle}>{policy.title}</div>
                </div>
                <div
                  className={styles["points"]}
                  dangerouslySetInnerHTML={{ __html: policy.description }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default FifthPage;
