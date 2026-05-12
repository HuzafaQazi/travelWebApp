import React, { useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import style from "./styles.module.css";
import ProfileDetailsForm from "./ProfileDetailsForm";
import CompanyDetailsForm from "./CompanyDetailsForm";
import MasterPassengerList from "./MasterPassengerList";

export default function ProfileSection({ userID }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [passengerTabOpened, setPassengerTabOpened] = useState(false);

  const handleProfileTabChange = (eventKey) => {
    setActiveTab(eventKey);
    if (eventKey === "passengers") {
      setPassengerTabOpened(true);
    }
  };

  return (
    <div
      className={style.rounded}
      style={{
        backgroundColor: "#028FA3",
        padding: "40px",
        width: "900px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "lightblue",
            margin: "auto",
            marginBottom: "24px",
          }}
        ></div>

        <Tab.Container activeKey={activeTab} onSelect={handleProfileTabChange}>
          <Nav variant="tabs" fill>
            <Nav.Item>
              <Nav.Link eventKey="profile" className={style.customnavlinkTop}>
                Profile Details
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="company" className={style.customnavlinkTop}>
                Company Details
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="passengers"
                className={style.customnavlinkTop}
              >
                Saved Passengers
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="profile">
              <ProfileDetailsForm userID={userID} />
            </Tab.Pane>
            <Tab.Pane eventKey="company">
              <CompanyDetailsForm userID={userID} />
            </Tab.Pane>
            <Tab.Pane eventKey="passengers">
              {passengerTabOpened && <MasterPassengerList />}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </div>
  );
}
