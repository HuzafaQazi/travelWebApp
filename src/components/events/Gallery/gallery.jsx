import { useState, useEffect } from "react";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import useSWR from "swr";
import { toast } from "react-toastify";
import style from "./style.module.css";
import Image from "next/image";
import gallery3 from "../../../../public/img/Frame 12.png";
import download from "../../../../public/img/align-bottom-01 (1).png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "../confirmationModal/ConfirmationModal";
import { saveAs } from "file-saver"; // Import file-saver
import { pusher } from "../../../../utils/pusher";
import showToast from "@/utils/toast";

const fetcher = async (url) => {
  const userId = getTabSpecificData("userID").replace(/"/g, "");
  const eventId = getTabSpecificData("event_id").replace(/"/g, "");
  const response = await axios.get(
    `${url}?user_id=${userId}&event_id=${eventId}`
  );
  return response.data.data;
};

const Gallery = () => {
  const userId = getTabSpecificData("userID").replace(/"/g, "");
  const eventId = getTabSpecificData("event_id").replace(/"/g, "");

  const { data, error, mutate } = useSWR(
    `${config.EVENTS_GALLERY_LIST}`,
    fetcher
  );

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  useEffect(() => {
    try {
      const channel = pusher.subscribe(`gallery-${eventId}`);
      channel.bind("new-image", (newImage) => {
        mutate(); // Refresh the gallery list
      });
    } catch (error) {
      console.error("Pusher error:", error);
    }

    return () => {
      pusher.unsubscribe(`gallery-${eventId}`);
    };
  }, [userId, eventId, mutate]);

  const handleImageUpload = async (event) => {
    const userId = getTabSpecificData("userID").replace(/"/g, "");
    const formData = new FormData();
    formData.append("image", event.target.files[0]);
    formData.append("user_id", userId);
    formData.append("event_id", eventId);

    try {
      setUploading(true);
      const response = await axios.post(
        `${config.EVENTS_GALLERY_UPLOAD}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          },
        }
      );
      mutate(); // SWR's mutate function refetches the data
      resetFileInput(event.target); // Reset file input
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("error","Failed to upload image");
    } finally {
      setUploading(false);
      setUploadProgress(0); // Reset upload progress
    }
  };

  const resetFileInput = (inputElement) => {
    inputElement.value = null;
  };

  const handleClick = (id = "") => {
    const fileInput = document.getElementById(id);
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleDelete = async (galleryId) => {
    try {
      const response = await axios.post(
        `${config.EVENTS_GALLERY_DELETE}/${galleryId}`,
        {
          user_id: userId,
          event_id: eventId,
        }
      );
      if (response.data.status) {
        showToast("success","Gallery image deleted successfully");
        mutate(); // Refetch gallery images after deletion
      } else {
        showToast("error","Failed to delete gallery image");
      }
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      showToast("error","Failed to delete gallery image");
    } finally {
      setDeleteModalOpen(false); // Close the modal after delete action
    }
  };

  const openDeleteModal = (id) => {
    setSelectedImageId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedImageId(null);
    setDeleteModalOpen(false);
  };

  const downloadImage = async (url, filename) => {
    try {
      saveAs(url, filename);
    } catch (error) {
      console.error("Error downloading image:", error);
      showToast("error","Failed to download image");
    }
  };

  if (error) return <div>Error loading gallery images</div>;
  if (!data) return <div>Loading...</div>;

  const galleryImages = data.results;
  const galleryImagesCount = data.totalCount;

  return (
    <>
      <div className={style.maincontainer}>
        <div className={style.Heading}>{galleryImagesCount} images</div>

        <div className={style.galleryGrid}>
          <div
            className={style.Imagecontainer}
            onClick={() => handleClick(`imageUpload`)}
          >
            <div className={style.innerContainer}>
              <input
                type="file"
                id={`imageUpload`}
                accept=".heic,.heif,image/heic,image/heif,.mpeg,.webp,image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <div htmlFor={`imageUpload`} className={style.upload}>
                {" "}
                {uploading ? "Uploading..." : "Upload Photos"}
              </div>
              {uploading && (
                <div className={style.progressBar}>
                  <div
                    className={style.progressFill}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              <Image src={gallery3} alt="Profile" className={style.line} />
            </div>
          </div>

          {galleryImages.map((gallery, index) => (
            <div key={index} className={style.outercontainer}>
              <div className={style.imageContainer1}>
                <Image
                  src={gallery.url}
                  alt="Profile"
                  className={style.galleryimage}
                  width={350}
                  height={2000}
                />
                {userId === gallery.user_id && (
                  <button
                    className={style.deleteButton}
                    onClick={() => openDeleteModal(gallery.id)}
                    // onClick={() => handleDelete(gallery.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
                <div
                  className={style.downloadIcon1}
                  onClick={() =>
                    downloadImage(gallery.url, `image-${gallery.id}.jpg`)
                  }
                >
                  <Image
                    src={download}
                    alt="Profile"
                    className={style.downloadIcon}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={() => handleDelete(selectedImageId)}
        />
      </div>
    </>
  );
};

export default Gallery;
