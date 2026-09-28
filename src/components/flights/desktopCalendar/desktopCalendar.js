import style from "./styles.module.css";
import { useEffect } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import Calendar from "react-calendar";

export default function DesktopCalendar({
  showOverlay,
  toggleOverlay,
  onDateSelect,
  onRetDateSelect,
}) {
  const [date, setDate] = useState(new Date());
  const [returnDate, setreturnDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
    onDateSelect(newDate);
  };

  const handleRetDateChange = (newDate) => {
    setreturnDate(newDate);
    onRetDateSelect(newDate);
  };
  const minDate = new Date();

  const currentDate = new Date();
  const maxDate = new Date(currentDate);

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // Determine the number of days based on whether it's a leap year
  const daysToAdd = isLeapYear(currentDate.getFullYear()) ? 366 : 365;
  maxDate.setDate(currentDate.getDate() + daysToAdd);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
          .react-calendar__navigation__prev2-button,
          .react-calendar__navigation__next2-button {
            display: none !important;
          }
        `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {showOverlay && (
        <div>
          <div className={style.backdrop} onClick={toggleOverlay}></div>
          <div className={style.calendarContainer}>
            <div className={style.depRetHead}>
              <div className={style.depHead}>
                Departure Date
                <div className={style.depDateDetails}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCalendarDays}
                      className={style.calenderIcon}
                    />
                    <span className={style.dateHighlight}>
                      {date.getDate()}
                    </span>
                    <span>
                      {date.toLocaleString("default", { month: "short" })}
                    </span>
                    <span>{date.getFullYear()}</span>
                  </div>
                </div>
              </div>
              <div className={style.retHead}>
                Return Date
                <div className={style.depDateDetails}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faCalendarDays}
                      className={style.calenderIcon}
                    />
                    <span className={style.dateHighlight}>
                      {returnDate.getDate()}
                    </span>
                    <span>
                      {returnDate.toLocaleString("default", { month: "short" })}
                    </span>
                    <span>{returnDate.getFullYear()}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* calendars for dep and return */}
            <div className={style.calendars}>
              <div>
                <Calendar
                  onChange={handleDateChange}
                  value={date}
                  minDate={currentDate}
                  maxDate={maxDate}
                  onClickDay={toggleOverlay}
                />
              </div>
              <div>
                <Calendar
                  onChange={handleRetDateChange}
                  value={returnDate}
                  minDate={currentDate}
                  maxDate={maxDate}
                  onClickDay={toggleOverlay}
                />
              </div>
            </div>

            {/* cancel and done buttons */}
            <div className={style.endColumn}>
              <div className={style.totalDays}>
                Total Number of Days :
                <span style={{ color: "#155EEF" }}> 3 Days </span>
              </div>
              <div className={style.buttons}>
                <button className={style.doneBtn} onClick={toggleOverlay}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
