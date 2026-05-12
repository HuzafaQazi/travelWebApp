// ConfirmationModal.js

import Modal from "react-modal";
import styles from "./ConfirmationModal.module.css";

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Confirm Delete Modal"
      className={styles.modal}
      overlayClassName={styles.overlay}
      ariaHideApp={false} // To prevent accessibility warning
    >
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
      <h2 className={styles.title}>Confirm Delete</h2>
      <p className={styles.message}>
        Are you sure you want to delete this image?
      </p>
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.cancel}`}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className={`${styles.button} ${styles.delete}`}
          onClick={onConfirm}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
