import { useEffect, useState, useRef } from "react"; // Import useState inside the curly braces
import style from "./styles.module.css";
import "bootstrap/dist/css/bootstrap.css";
import "reactjs-popup/dist/index.css";

const AmenitiesList = ({ amenities }) => {
  const [showPopup, setShowPopup] = useState(false); // Move the state declaration inside the functional component
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [popupVisible, setPopupVisible] = useState(false);

  const popupRef = useRef(null);

  const handleClickOutside = (e) => { 
    if (popupRef.current && !popupRef.current.contains(e.target)) {
       setShowPopup(false);
    }
  };
  const viewMoreAmenities = async (e) => {
    e.preventDefault();
     const rect = e.target.getBoundingClientRect();
     setPopupPosition({ top: rect.bottom, left: rect.left });
    setShowPopup(true);
  };
  
  useEffect(() => {

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const amenitiesList = amenities?.[0]?.split(',').map((item) => item.trim());

  return (
    <>
      <div>
        <ul className="unordered-list">
          {amenitiesList&&amenitiesList?.length > 0 ? (
            amenitiesList.map((item, index) => (
              <li key={index} className="list-item">
                <p className="hotelDetailsBalcony">{item}</p>
              </li>
            ))
          ) : (
            <li className="list-item">No facilities available</li>
          )}
        </ul>
        {amenitiesList&&amenitiesList?.length > 5 && (
          <div className={style.viewmoreamenities} onClick={viewMoreAmenities} ref={popupRef}>
          View more
          </div>
         )}
      </div>
      
      {showPopup && (
        <div className={style.popup}>
        <div className={style.amenitiesheading}>Amenities</div>
        <ul className="unordered-list">
          {amenitiesList.length > 0 ? (
            amenitiesList.map((item, index) => (
              <li key={index} className="list-item">
                <p className="hotelDetailsBalcony">{item}</p>
              </li>
            ))
          ) : (
            <li className="list-item">No facilities available</li>
          )}
        </ul>
      
        </div>
      )}
    </>
  );
};

export default AmenitiesList;