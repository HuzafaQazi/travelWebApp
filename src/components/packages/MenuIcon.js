// components/MenuIcon.js
import { useState } from "react";
import Link from "next/link";
import styles from "./MenuIcon.module.css";

const MenuIcon = () => {
  const [isActive, setIsActive] = useState(false);

  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  return (
    <div
      className={`${styles.menuIcon} ${isActive ? styles.active : ""}`}
      onClick={toggleMenu}
    >
      <div className={styles.menuBar}></div>
      <div className={styles.menuBar}></div>
      <div className={styles.menuBar}></div>
      <nav className={styles.navMenu}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link href="/">Home</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MenuIcon;
