import { useState, useEffect } from "react";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import useSWR from "swr";
import config from "@/config";
import styles from "./style.module.css";
import profile from "../../../../public/img/Group 14493.png";
import Image from "next/image";
import { toast } from "react-toastify";
import pdfIcon from "../../../../public/img/pdf.png";
import showToast from "@/utils/toast";
const fetcher = async (url) => {
  const userId = getTabSpecificData("userID");
  const eventId = getTabSpecificData("event_id");
  const response = await axios.get(
    `${url}?user_id=${userId}&event_id=${eventId}`
  );
  return response.data.data;
};

const Details = () => {
  const { data, error, mutate } = useSWR(
    `${config.EVENTS_REGISTRATION_DETAILS}`,
    fetcher
  );

  const [formData, setFormData] = useState({
    ticketNumber: "",
    roomNumber: "",
    busServiceAvailed: false,
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        ticketNumber: data.ticket_number || "",
        roomNumber: data.room_number || "",
        busServiceAvailed:
          data.is_bus_pickup_required || data.is_bus_drop_required,
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventId = getTabSpecificData("event_id");
      const userId = getTabSpecificData("userID");
      const payload = {
        event_id: eventId,
        user_id: userId,
        ticket_number: formData.ticketNumber,
        room_number: formData.roomNumber,
      };
      const response = await axios.put(
        `${config.EVENTS_UPDATE_DETAILS}`,
        payload
      );
      if (response.data.status) {
        showToast("success","Details updated successfully!");
        setEditMode(false);
        mutate(); // Re-fetch the data after successful update
      }
    } catch (error) {
      showToast("error",
        error.response.data.error.errormessage || "Something went wrong!"
      );
      console.error("Error updating details:", error);
    }
  };

  if (error) return <div>Error loading details</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.container1}>
          <div className={styles.imageWithText}>
            <div className={styles.imageContainer}>
              <Image
                src={profile}
                alt="Profile"
                className={styles.profileImage}
              />
            </div>
            <div className={styles.textContainer}>
              <div className={styles.nameText}>{data.full_name}</div>
              <div className={styles.phoneText}>
                +91 {data.mobile}, {data.email}
              </div>
            </div>
          </div>
          <div className={styles.belowContainer}>
            {editMode ? (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="ticketNumber" className={styles.label}>
                    Ticket Number:
                  </label>
                  <input
                    type="text"
                    id="ticketNumber"
                    name="ticketNumber"
                    value={formData.ticketNumber}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="roomNumber" className={styles.label}>
                    Room Number:
                  </label>
                  <input
                    type="text"
                    id="roomNumber"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="checkbox"
                    id="busServiceAvailed"
                    name="busServiceAvailed"
                    checked={formData.busServiceAvailed}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <label
                    htmlFor="busServiceAvailed"
                    className={styles.checkboxLabel}
                  >
                    Bus Service Availed
                  </label>
                </div>
                <button type="submit" className={styles.updateButton}>
                  Update Details
                </button>
              </form>
            ) : (
              <>
                <div className={styles.mainHeading}>
                  Hotel Room number:{" "}
                  <span className={styles.subHeading}>
                    {formData.roomNumber}
                  </span>{" "}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {(data.ticket_url?.length > 0 || data.aadhar_url || data.pan_url) && (
        <div className={styles.uploadContainer}>
          <div className={styles.Heading}>Documents Uploaded</div>
          <div className={styles.galleryGrid}>
            {data.ticket_url &&
              Array.isArray(data.ticket_url) &&
              data.ticket_url.map((url, index) => (
                <div className={styles.Imagecontainer} key={index}>
                  {url.endsWith(".pdf") ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <Image
                        src={pdfIcon}
                        alt={`Ticket ${index + 1}`}
                        className={styles.gallery}
                        width={380}
                        height={380}
                      />
                    </a>
                  ) : (
                    <Image
                      src={url}
                      alt={`Ticket ${index + 1}`}
                      className={styles.gallery}
                      width={380}
                      height={380}
                    />
                  )}
                </div>
              ))}
            {data.aadhar_url && (
              <div className={styles.Imagecontainer}>
                {data.aadhar_url.endsWith(".pdf") ? (
                  <a
                    href={data.aadhar_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={pdfIcon}
                      alt="Aadhar"
                      className={styles.gallery}
                      width={380}
                      height={380}
                    />
                  </a>
                ) : (
                  <Image
                    src={data.aadhar_url}
                    alt="Aadhar"
                    className={styles.gallery}
                    width={380}
                    height={380}
                  />
                )}
              </div>
            )}
            {data.pan_url && (
              <div className={styles.Imagecontainer}>
                {data.pan_url.endsWith(".pdf") ? (
                  <a
                    href={data.pan_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={pdfIcon}
                      alt="Pan"
                      className={styles.gallery}
                      width={380}
                      height={380}
                    />
                  </a>
                ) : (
                  <Image
                    src={data.pan_url}
                    alt="Pan"
                    className={styles.gallery}
                    width={380}
                    height={380}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Details;
