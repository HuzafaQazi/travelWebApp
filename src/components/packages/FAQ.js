import { useState } from "react";
import styles from "./style.module.css"; // Import CSS styles for the component

const FAQSection = ({ faqs }) => {
  // Initialize the FAQ data based on the 'faqs' prop
  const [faqData, setFaqData] = useState(
    faqs.map((faq) => ({
      question: faq.title,
      answer: faq.description,
      isActive: false,
    }))
  );

  const toggleActive = (index) => {
    setFaqData((prevData) =>
      prevData.map((item, i) =>
        i === index ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  return (
    <div className={styles["faq-section"]}>
      <center>
        <h2 style={{ fontFamily: "oswald" }}>Frequently Asked Questions</h2>
      </center>
      <center>
        <p style={{ textAlign: "center" }}>
          Have questions? We’re here to help.
        </p>
      </center>
      <section className={styles["faq-container"]}>
        {faqData.map((faq, index) => (
          <div key={index}>
            {/* FAQ question */}
            <div
              className={`${styles["faq-page"]} ${
                faq.isActive ? styles["active"] : ""
              }`}
              onClick={() => toggleActive(index)}
            >
              {faq.question}
            </div>
            {/* FAQ answer */}
            {faq.isActive && (
              <div
                className={styles["faq-body"]}
                style={{ display: faq.isActive ? "block" : "none" , "backgroundColor" : "#f9f9f9" }}
              >
                <p dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
              </div>
            )}
            <hr className={styles["hr-line"]} />
          </div>
        ))}
      </section>
    </div>
  );
};

export default FAQSection;
