import styles from "./style.module.css";
import Navigation from "../packages/Navigation";

const FirstPage = ({ title }) => {
  return (
    <div className={styles["first-page"]} id={styles["full-screen"]}>
      <Navigation />
      <div class={styles["beach-heading"]}>
        <div class={styles["vertical"]}></div>
        <h1 className={styles.travelguideTitle}>{title}</h1>
      </div>
    </div>
  );
};

export default FirstPage;
