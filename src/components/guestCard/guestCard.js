import { useState, useEffect } from "react";
import style from "./styles.module.css";
import Dropdown from "react-bootstrap/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus } from "@fortawesome/free-solid-svg-icons";

const GuestCard = ({ id, onDelete, onChange, updateFlag }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {}, [updateFlag]);

  const handleFirstNameChange = (event) => {
    event.preventDefault(); // Prevent default behavior
    const value = event.target.value;
    setFirstName(value);
    onChange(firstName, lastName, value, lastName);
  };

  const handleLastNameChange = (event) => {
    event.preventDefault(); // Prevent default behavior
    const value = event.target.value;
    setLastName(value);
    onChange(firstName, value, firstName, value);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  return (
    <div>
      <div className={style.userDetails}>
        <div>
          <div>
            <p className={style.leadTravelerName}>Traveller First Name *</p>
          </div>
          <div className={style.userDetailsName}>
            <Dropdown className={style.dropDown}>
              <Dropdown.Toggle
                variant="success"
                id="dropdown-basic"
                className={style.toggleDropDown}
              >
                Mr
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">Mr</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Mrs</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Miss</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <input
              type="text"
              className={style.userName}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^A-Za-z .]/g, ""); // Replace characters other than alphabets, spaces, and periods with empty string
              }}
              value={firstName}
              maxLength={30}
              onChange={handleFirstNameChange}
            />
          </div>
        </div>
        <div>
          <div>
            <p className={style.leadTravelerName}>Last name *</p>
          </div>
          <div className={style.userDetailsName}>
            <input
              type="text"
              className={style.userName}
              onChange={handleLastNameChange}
              value={lastName}
            />
          </div>
        </div>
      </div>
      <button onClick={handleDelete} className={style.deleteButton}>
        <span className={style.iconContainer}>
          <FontAwesomeIcon icon={faMinus} className={style.minusIcon} />
        </span>
        Delete Guest
      </button>
    </div>
  );
};

export default GuestCard;
