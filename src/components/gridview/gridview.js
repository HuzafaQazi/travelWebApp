import { useEffect } from "react";
import style from "./styles.module.css"; // Import the CSS file for styling
import { useState } from "react";

const GridView = (props) => {
  const [facilites, setFacilities] = useState([]);
  const facilitiesData = props.facilitesData;

  useEffect(() => {
    if (props.facilitesData) {
      setFacilities(props.facilitesData);
    } else {
      setFacilities(null);
    }
  }, [props.facilitesData]);

  let hardCodedData = [
    "Dry cleaning/laundry service",
    "Garden",
    "Safe-deposit box at front desk",
    "In-room accessibility (in select rooms)",
    "Laundry facilities",
    "Free newspapers in lobby",
    "Use of nearby fitness center (discount)",
    "Reception hall",
    "24-hour front desk",
    "Terrace",
    "Free WiFi",
  ];
  return (
    <div className={style}>
      <ul className="unordered-list">
        {facilites !== null && facilites !== undefined ? (
          facilites.map((item, index) => (
            <li key={index} className={style["list-item"]}>
              {item}
            </li>
          ))
        ) : (
          <li className={style}>No facilities available</li>
        )}
      </ul>
    </div>
  );
};

export default GridView;
