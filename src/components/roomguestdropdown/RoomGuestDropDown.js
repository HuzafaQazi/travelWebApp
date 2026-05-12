import { useState } from "react";
import style from "./styles.module.css";
import Dropdown from "react-bootstrap/Dropdown";

const RoomGuestDropdown = () => {
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [age, setAge] = useState([]);

  const handleRoomChange = (event) => {
    setRooms(event.target.value);
  };

  const handleAdultChange = (event) => {
    setAdults(event.target.value);
  };

  const handleChildChange = (event) => {
    const childCount = event.target.value;
    setChildren(childCount);
    const ageArray = [];
    for (let i = 0; i < childCount; i++) {
      ageArray.push("");
    }
    setAge(ageArray);
  };

  const handleAgeChange = (event, index) => {
    const ageArray = [...age];
    ageArray[index] = event.target.value;
    setAge(ageArray);
  };

  return (
    <div className={`col-xl-3  align-items-stretch`}>
      <div className="icon-box mt-4 mt-xl-0">
        <i className="bx bx-cube-alt"></i>
        <Dropdown>
          <Dropdown.Toggle
            variant="secondary"
            id="dropdown-basic"
            className={style.dropdown}
          >
            {rooms} Rooms, {adults} Adults, {children} Children
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <div className="dropdown-item">
              <label htmlFor="rooms">Rooms</label>
              <select
                className="form-control"
                id="rooms"
                value={rooms}
                onChange={handleRoomChange}
                min="1"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className="dropdown-item">
              <label htmlFor="adults">Adults</label>
              <select
                className="form-control"
                id="adults"
                value={adults}
                min="1"
                onChange={handleAdultChange}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className="dropdown-item">
              <label htmlFor="children">Children</label>
              <select
                className="form-control"
                id="children"
                value={children}
                onChange={handleChildChange}
              >
                <option value="0">None</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            {children > 0 && (
              <div className="dropdown-item">
                <label>Age of Children</label>
                {age.map((childAge, index) => (
                  <select
                    key={index}
                    className="form-control"
                    value={childAge}
                    style={{ marginBottom: "4px" }}
                    onChange={(e) => handleAgeChange(e, index)}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )
                    )}
                  </select>
                ))}
              </div>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default RoomGuestDropdown;
