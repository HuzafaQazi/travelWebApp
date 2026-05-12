import React from "react";
import Image from "next/image";
import styles from "./styles.module.css";
import whatsapp from "../../../public/img/whatsappchat.png";

export default function Chaticon() {
  return (
    <>
      <div className={styles.whatsappcontainer}>
        <a
          href="https://api.whatsapp.com/send?phone=7204186969"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={whatsapp}
            alt="WhatsApp Icon"
            className={styles.whatsappIcon}
          />
        </a>
      </div>
    </>
  );
}
