import styles from "./style.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faCaretDown,
  faCaretUp,
  faPlaneUp,
  faShareNodes,
  faPlusCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Image from "next/image";
import vectoruser from "../../../../public/img/vectoruser.png";
import vectorflight from "../../../../public/img/vectorflight.png";
import iconinfo from "../../../../public/img/infiicon.png";
import "tailwindcss/tailwind.css";
import traveller from "../../../../public/img/Layer_1.png";

const Travelpolicy = () => {
  const [activeTab, setActiveTab] = useState("flight");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded3, setIsExpanded3] = useState(false);
  const [isExpanded4, setIsExpanded4] = useState(false);
  const [isExpanded5, setIsExpanded5] = useState(false);
  const [isExpanded6, setIsExpanded6] = useState(false);
  const [isExpanded7, setIsExpanded7] = useState(false);
  const [isExpanded8, setIsExpanded8] = useState(false);
  const [isExpanded9, setIsExpanded9] = useState(false);
  const [isExpanded1, setIsExpanded1] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isContentVisible1, setIsContentVisible1] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);
  const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);
  const [isDropdownOpen0, setIsDropdownOpen0] = useState(false);

  const [isDropdownOpen3, setIsDropdownOpen3] = useState(false);
  const [isDropdownOpen4, setIsDropdownOpen4] = useState(false);
  const [istravel, setIstravel] = useState(false);
  const toggletravelopen = () => {
    setIstravel(!istravel);
  };
  const toggletravelclose = () => {
    setIstravel(false);
  };

  const [checkboxes, setCheckboxes] = useState({
    Sales: false,
    Marketing: false,
    Engineering: false,
  });

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setCheckboxes((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  const toggleDropdown0 = () => {
    setIsDropdownOpen0(!isDropdownOpen0);
  };
  const toggleDropdown3 = () => {
    setIsDropdownOpen3(!isDropdownOpen3);
  };
  const toggleDropdown4 = () => {
    setIsDropdownOpen4(!isDropdownOpen4);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDropdown1 = () => {
    setIsDropdownOpen1(!isDropdownOpen1);
  };
  const toggleDropdown2 = () => {
    setIsDropdownOpen2(!isDropdownOpen2);
  };

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };
  const toggleContentVisibility1 = () => {
    setIsContentVisible1(!isContentVisible1);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleExpand2 = () => {
    setIsExpanded2(!isExpanded2);
  };

  const toggleExpand3 = () => {
    setIsExpanded3(!isExpanded3);
  };
  const toggleExpand4 = () => {
    setIsExpanded4(!isExpanded4);
  };
  const toggleExpand5 = () => {
    setIsExpanded5(!isExpanded5);
  };

  const toggleExpand6 = () => {
    setIsExpanded6(!isExpanded6);
  };
  const toggleExpand7 = () => {
    setIsExpanded7(!isExpanded7);
  };
  const toggleExpand8 = () => {
    setIsExpanded8(!isExpanded8);
  };
  const toggleExpand9 = () => {
    setIsExpanded9(!isExpanded9);
  };
  const toggleExpand1 = () => {
    setIsExpanded1(!isExpanded1);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className={styles.travelpolicydiv}>
          <div
            className={`${styles.flight} ${
              activeTab === "flight" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("flight")}
          >
            <FontAwesomeIcon icon={faPlaneUp} /> Flight
          </div>
          <div
            className={`${styles.hotel} ${
              activeTab === "hotel" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("hotel")}
          >
            <FontAwesomeIcon icon={faBed} /> Hotel
          </div>
        </div>
        <div style={{ marginTop: "20px", marginRight: "20px" }}>
          <button className={styles.DepBtn} onClick={toggletravelopen}>
            <span>
              <FontAwesomeIcon icon={faPlusCircle} />
            </span>
            <span className={styles.createText}>Add Travel Policy</span>
          </button>
        </div>
      </div>

      {istravel && (
        <>
          <div className={styles.popupcontainers}>
            <div style={{ display: "flex" }}>
              <Image
                src={traveller}
                className={styles.travellerImage}
                alt="User"
              />
              <div style={{ marginTop: "50px" }}>
                <div className={styles.department}>Add Travel Policy</div>
                <div className={styles.departmentText}>
                  Travel policy to streamline the travel of the employees
                </div>
              </div>
              <div style={{ marginRight: "30px", display: "end" }}>
                <FontAwesomeIcon
                  icon={faXmarkCircle}
                  onClick={toggletravelclose}
                />
              </div>
            </div>
            <div>
              <hr />
            </div>

            <div>
              <div
                style={{
                  width: "300px",
                  marginBottom: "10px",
                  marginLeft: "10px",
                }}
              >
                <div class="w-full mt-5">
                  <div class="relative w-full min-w-[50px] h-10">
                    <input
                      class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                      placeholder=" "
                    />
                    <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                      {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                      Name of the policy*
                    </label>
                  </div>
                </div>
              </div>
              <div className={styles.middlecontainer}>
                <div className={styles.CreateText}>
                  Select the options to map against travel policies
                </div>
                <div className={styles.CreateText1}>
                  This will align your travel policy to these selected option
                </div>
              </div>

              <div className={styles.lastcontainer}>
                <div className={styles.companyType}>
                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters} onClick={toggleDropdown0}>
                      Department
                    </p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={isDropdownOpen ? faCaretUp : faCaretDown}
                    />
                  </label>

                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters} onClick={toggleDropdown3}>
                      Designation
                    </p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={isDropdownOpen1 ? faCaretUp : faCaretDown}
                    />
                  </label>

                  {isDropdownOpen0 && (
                    <div className={styles.dropdownContentd}>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Sales}
                          onChange={() => handleOptionClick("Sales")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Sales" ? styles.selected : ""
                          }`}
                          onClick={() => handleOptionClick("Sales")}
                        >
                          Sales
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Marketing}
                          onChange={() => handleOptionClick("Marketing")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Marketing"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Marketing")}
                        >
                          Software
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Engineering}
                          onChange={() => handleOptionClick("Engineering")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Engineering"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Engineering")}
                        >
                          Operations
                        </span>
                      </div>
                    </div>
                  )}

                  {isDropdownOpen3 && (
                    <div className={styles.dropdownContent13}>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Sales}
                          onChange={() => handleOptionClick("Sales")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Sales" ? styles.selected : ""
                          }`}
                          onClick={() => handleOptionClick("Sales")}
                        >
                          Director
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Marketing}
                          onChange={() => handleOptionClick("Marketing")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Marketing"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Marketing")}
                        >
                          Manager
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Engineering}
                          onChange={() => handleOptionClick("Engineering")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Engineering"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Engineering")}
                        >
                          Executive
                        </span>
                      </div>
                    </div>
                  )}

                  {isDropdownOpen4 && (
                    <div className={styles.dropdownContent22}>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Sales}
                          onChange={() => handleOptionClick("Sales")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Sales" ? styles.selected : ""
                          }`}
                          onClick={() => handleOptionClick("Sales")}
                        >
                          Level A
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Marketing}
                          onChange={() => handleOptionClick("Marketing")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Marketing"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Marketing")}
                        >
                          Level B
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Engineering}
                          onChange={() => handleOptionClick("Engineering")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Engineering"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Engineering")}
                        >
                          Level C
                        </span>
                      </div>
                    </div>
                  )}

                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters} onClick={toggleDropdown4}>
                      Level
                    </p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={isDropdownOpen2 ? faCaretUp : faCaretDown}
                    />
                  </label>

                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters}>Employee</p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={faCaretDown}
                    />
                  </label>
                </div>
              </div>
              <div></div>
            </div>
            <div style={{ marginTop: "50px" }}>
              <hr />
            </div>

            <div className={styles.cancelandsavecontainer1}>
              <button
                className={styles.cancelbutton}
                onClick={toggletravelclose}
              >
                Cancel
              </button>
              <button className={styles.savebutton} onClick={toggletravelclose}>
                Add travel policy
              </button>
            </div>
          </div>
        </>
      )}

      <div className={styles.tabContent}>
        {activeTab === "flight" && (
          <div>
            <div
              className={styles.globalcontainer}
              onClick={toggleContentVisibility}
            >
              <div>
                <div className={styles.globaltext}>Global Travel Policy</div>
                <div className={styles.globalsubtext}>
                  General rules will be applied to all Departments, Groups and
                  Sub-groups{" "}
                </div>
              </div>
              <div className={styles.rightcontent}>
                <div className={styles.duplicate}>Duplicate</div>
                <div className={styles.share}>
                  <FontAwesomeIcon
                    className={styles.icon}
                    icon={faShareNodes}
                  />
                  Share
                </div>
                <div className={styles.arrow}>
                  {" "}
                  <FontAwesomeIcon
                    className={styles.careticon}
                    icon={isContentVisible ? faCaretUp : faCaretDown}
                  />{" "}
                </div>
              </div>
            </div>

            {isContentVisible && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectoruser}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>Eligibility</div>
                      <div className={styles.eligibilitysubtext}>
                        Who can do the flight bookings
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded && (
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <input type="checkbox" className={styles.checkbox} />

                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>Self-book</div>
                          <div className={styles.selfbooktext}>
                            Employees can only book for themselves{" "}
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage2}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <input type="checkbox" className={styles.checkbox} />
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>For Colleagues</div>
                          <div className={styles.selfbooktext}>
                            Employees can only book for colleagues{" "}
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage3}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <input type="checkbox" className={styles.checkbox} />
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>Both</div>
                          <div className={styles.selfbooktext}>
                            Employees can book for both colleagues and
                            themselves
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage1}
                        alt="Userinfo"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* budget details */}
            {isContentVisible && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectoruser}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>Budget</div>
                      <div className={styles.eligibilitysubtext}>
                        There{"'"}s a set limit for how much can be spent per
                        person per flight
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand2}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded2 ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded2 && (
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>
                            Domestic Flights
                          </div>
                          <div class="w-full mt-5">
                            <div class="relative w-full min-w-[50px] h-10">
                              <input
                                class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                                placeholder=" "
                              />
                              <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                                {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                                Amount
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImageb2}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>
                            International Flights
                          </div>
                          <div class="w-full mt-5">
                            <div class="relative w-full min-w-[50px] h-10">
                              <input
                                class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                                placeholder=" "
                              />
                              <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                                {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                                Amount
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImageb3}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>Local Flights</div>
                          <div class="w-full mt-5">
                            <div class="relative w-full min-w-[50px] h-10">
                              <input
                                class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                                placeholder=" "
                              />
                              <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                                {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                                Amount
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImageb1}
                        alt="Userinfo"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comfort */}

            {isContentVisible && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectoruser}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>
                        Comfort and Convenience
                      </div>
                      <div className={styles.eligibilitysubtext}>
                        Select which class of seats and add-on employees can
                        choose
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand3}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded3 ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded3 && (
                  <div className={styles.dropdownContentC}>
                    <div className={styles.dropdownContent2}>
                      <div className={styles.classText}>class</div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner1}>
                          <div className={styles.textContainer1}>
                            <input
                              type="checkbox"
                              className={styles.checkbox1}
                            />
                            <div className={styles.selfbook1}>Economy</div>
                          </div>
                        </div>
                        <Image
                          src={iconinfo}
                          className={styles.userImagec2}
                          alt="Userinfo"
                        />
                      </div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner1}>
                          <div className={styles.textContainer1}>
                            <input
                              type="checkbox"
                              className={styles.checkbox1}
                            />
                            <div className={styles.selfbook1}>Premium</div>
                          </div>
                        </div>
                        <Image
                          src={iconinfo}
                          className={styles.userImagec3}
                          alt="Userinfo"
                        />
                      </div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner1}>
                          <div className={styles.textContainer1}>
                            <input
                              type="checkbox"
                              className={styles.checkbox1}
                            />
                            <div className={styles.selfbook1}>Business</div>
                          </div>
                        </div>
                        <Image
                          src={iconinfo}
                          className={styles.userImagec1}
                          alt="Userinfo"
                        />
                      </div>
                    </div>
                    <hr className={styles.horizontalline} />
                    <div className={styles.dropdownContent2}>
                      <div className={styles.classText1}>Add-ons</div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner}>
                          <input type="checkbox" className={styles.checkbox2} />

                          <div className={styles.textContainer}>
                            <div className={styles.selfbook}>Meals</div>
                            <div className={styles.selfbooktext}>
                              Employees can only book for themselves{" "}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner}>
                          <input type="checkbox" className={styles.checkbox2} />
                          <div className={styles.textContainer}>
                            <div className={styles.selfbook}>Extra-baggage</div>
                            <div className={styles.selfbooktext}>
                              Employees can only book for themselves{" "}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner}>
                          <input type="checkbox" className={styles.checkbox2} />
                          <div className={styles.textContainer}>
                            <div className={styles.selfbook}>
                              Seat selection
                            </div>
                            <div className={styles.selfbooktext}>
                              Employees can only book for themselves{" "}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr className={styles.horizontalline} />
                    <div className={styles.datecontainer1}>
                      <div className={styles.dateText}>Date change</div>
                      <div className={styles.datecontainer}>
                        <label className={styles.checkboxContainer}>
                          <input type="checkbox" className={styles.checkbox4} />
                          <span className={styles.checkmark}></span>
                          Allow employees to change the date
                        </label>
                        <label className={styles.checkboxContainer}>
                          <input type="checkbox" className={styles.checkbox4} />
                          <span className={styles.checkmark}></span>
                          Don’t Allow employees to change the date
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* booking window */}

            {isContentVisible && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectorflight}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>
                        Booking Window
                      </div>
                      <div className={styles.eligibilitysubtext}>
                        Booking Timeframe: There{"'"}s a time limit for booking
                        flights within policy
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand5}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded5 ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded5 && (
                  <div className={styles.dropdownContent6}>
                    <div style={{ display: "flex" }}>
                      <div class="w-full mt-5" style={{ marginRight: "40px" }}>
                        <div class="relative w-full min-w-[50px] h-10">
                          <input
                            class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                            placeholder=" "
                          />
                          <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                            {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                            From
                          </label>
                        </div>
                      </div>

                      <div class="w-full mt-5" style={{ marginRight: "40px" }}>
                        <div class="relative w-full min-w-[50px] h-10">
                          <input
                            class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                            placeholder=" "
                          />
                          <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                            {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                            To
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* booking notification */}
            {isContentVisible && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectorflight}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>
                        Booking Notification
                      </div>
                      <div className={styles.eligibilitysubtext1}>
                        Notifying booking to approvers while booking flights
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand4}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded4 ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded4 && (
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div>
                          <div className={styles.bookingnotify}>
                            Domestic Flights
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>None</div>
                              <div className={styles.selfbooktext}>
                                Approvers won’t be notified in any bookings{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                Out-Of-Policy
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in out-of-policy
                                bookings only{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                All Bookings
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in all kind of
                                bookings{" "}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage2}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div>
                          <div className={styles.bookingnotify}>
                            International Flights
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>None</div>
                              <div className={styles.selfbooktext}>
                                Approvers won’t be notified in any bookings{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                Out-Of-Policy
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in out-of-policy
                                bookings only{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                All Bookings
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in all kind of
                                bookings{" "}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage3}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div>
                          <div className={styles.bookingnotify}>
                            Local Flights
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>None</div>
                              <div className={styles.selfbooktext}>
                                Approvers won’t be notified in any bookings{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                Out-Of-Policy
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in out-of-policy
                                bookings only{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                All Bookings
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in all kind of
                                bookings{" "}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage1}
                        alt="Userinfo"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.globalcontainer1}>
              <div
                style={{
                  width: "300px",
                  marginBottom: "10px",
                  marginLeft: "10px",
                }}
              >
                <div class="w-full mt-5">
                  <div class="relative w-full min-w-[50px] h-10">
                    <input
                      class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                      placeholder=" "
                    />
                    <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                      {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                      Edit the name
                    </label>
                  </div>
                </div>
              </div>
              <div className={styles.middlecontainer}>
                <div className={styles.CreateText}>
                  Select the options to map against travel policies
                </div>
                <div className={styles.CreateText1}>
                  This will align your travel policy to these selected option
                </div>
              </div>
              <div className={styles.lastcontainer}>
                <div className={styles.companyType}>
                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters} onClick={toggleDropdown}>
                      Department
                    </p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={isDropdownOpen ? faCaretUp : faCaretDown}
                    />
                  </label>

                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters} onClick={toggleDropdown1}>
                      Designation
                    </p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={isDropdownOpen1 ? faCaretUp : faCaretDown}
                    />
                  </label>

                  {isDropdownOpen && (
                    <div className={styles.dropdownContentbd}>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Sales}
                          onChange={() => handleOptionClick("Sales")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Sales" ? styles.selected : ""
                          }`}
                          onClick={() => handleOptionClick("Sales")}
                        >
                          Sales
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Marketing}
                          onChange={() => handleOptionClick("Marketing")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Marketing"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Marketing")}
                        >
                          Software
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Engineering}
                          onChange={() => handleOptionClick("Engineering")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Engineering"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Engineering")}
                        >
                          Operations
                        </span>
                      </div>
                    </div>
                  )}

                  {isDropdownOpen1 && (
                    <div className={styles.dropdownContent12}>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Sales}
                          onChange={() => handleOptionClick("Sales")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Sales" ? styles.selected : ""
                          }`}
                          onClick={() => handleOptionClick("Sales")}
                        >
                          Director
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Marketing}
                          onChange={() => handleOptionClick("Marketing")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Marketing"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Marketing")}
                        >
                          Manager
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Engineering}
                          onChange={() => handleOptionClick("Engineering")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Engineering"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Engineering")}
                        >
                          Executive
                        </span>
                      </div>
                    </div>
                  )}

                  {isDropdownOpen2 && (
                    <div className={styles.dropdownContent21}>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Sales}
                          onChange={() => handleOptionClick("Sales")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Sales" ? styles.selected : ""
                          }`}
                          onClick={() => handleOptionClick("Sales")}
                        >
                          Level A
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Marketing}
                          onChange={() => handleOptionClick("Marketing")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Marketing"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Marketing")}
                        >
                          Level B
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Engineering}
                          onChange={() => handleOptionClick("Engineering")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Engineering"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Engineering")}
                        >
                          Level C
                        </span>
                      </div>
                    </div>
                  )}

                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters} onClick={toggleDropdown2}>
                      Level
                    </p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={isDropdownOpen2 ? faCaretUp : faCaretDown}
                    />
                  </label>

                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters}>Employee</p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={faCaretDown}
                    />
                  </label>
                </div>
                <div className={styles.cancelandsavecontainer}>
                  <button className={styles.cancelbutton}>Cancel</button>
                  <button className={styles.savebutton}>Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "hotel" && (
          <div>
            <div
              className={styles.globalcontainer}
              onClick={toggleContentVisibility1}
            >
              <div>
                <div className={styles.globaltext}>Global Travel Policy</div>
                <div className={styles.globalsubtext}>
                  General rules will be applied to all Departments, Groups and
                  Sub-groups{" "}
                </div>
              </div>
              <div className={styles.rightcontent}>
                <div className={styles.duplicate}>Duplicate</div>
                <div className={styles.share}>
                  <FontAwesomeIcon
                    className={styles.icon}
                    icon={faShareNodes}
                  />
                  Share
                </div>
                <div className={styles.arrow}>
                  {" "}
                  <FontAwesomeIcon
                    className={styles.careticon}
                    icon={isContentVisible ? faCaretUp : faCaretDown}
                  />{" "}
                </div>
              </div>
            </div>

            {isContentVisible1 && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectoruser}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>Eligibility</div>
                      <div className={styles.eligibilitysubtext}>
                        Who can do the hotel bookings
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand6}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded6 ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded6 && (
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <input type="checkbox" className={styles.checkbox} />

                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>Self-book</div>
                          <div className={styles.selfbooktext}>
                            Employees can only book for themselves{" "}
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage2}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <input type="checkbox" className={styles.checkbox} />
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>For Colleagues</div>
                          <div className={styles.selfbooktext}>
                            Employees can only book for colleagues{" "}
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage3}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <input type="checkbox" className={styles.checkbox} />
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>Both</div>
                          <div className={styles.selfbooktext}>
                            Employees can book for both colleagues and
                            themselves
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage1}
                        alt="Userinfo"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* budget details */}
            {isContentVisible1 && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectoruser}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>Budget</div>
                      <div className={styles.eligibilitysubtext}>
                        There{"'"}s a set limit for how much can be spent per
                        person per room
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand7}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded7 ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded7 && (
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>Domestic Stay</div>
                          <div class="w-full mt-5">
                            <div class="relative w-full min-w-[50px] h-10">
                              <input
                                class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                                placeholder=" "
                              />
                              <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                                {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                                Amount
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImageb2}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>
                            International Stay
                          </div>
                          <div class="w-full mt-5">
                            <div class="relative w-full min-w-[50px] h-10">
                              <input
                                class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                                placeholder=" "
                              />
                              <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                                {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                                Amount
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImageb3}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div className={styles.textContainer}>
                          <div className={styles.selfbook}>Local Stay</div>
                          <div class="w-full mt-5">
                            <div class="relative w-full min-w-[50px] h-10">
                              <input
                                class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                                placeholder=" "
                              />
                              <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                                {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                                Amount
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImageb1}
                        alt="Userinfo"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comfort */}

            {isContentVisible1 && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectoruser}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>
                        Hotel Category
                      </div>
                      <div className={styles.eligibilitysubtext}>
                        Select which hotel category and type for the employees
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand8}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded8 ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded8 && (
                  <div className={styles.dropdownContentC}>
                    <div className={styles.dropdownContent2}>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner}>
                          <div className={styles.textContainer1}>
                            <input
                              type="checkbox"
                              className={styles.checkbox1}
                            />
                            <div className={styles.selfbook1}>Economy</div>
                          </div>
                        </div>
                        <Image
                          src={iconinfo}
                          className={styles.userImagec2}
                          alt="Userinfo"
                        />
                      </div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner}>
                          <div className={styles.textContainer1}>
                            <input
                              type="checkbox"
                              className={styles.checkbox1}
                            />
                            <div className={styles.selfbook1}>Premium</div>
                          </div>
                        </div>
                        <Image
                          src={iconinfo}
                          className={styles.userImagec3}
                          alt="Userinfo"
                        />
                      </div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner}>
                          <div className={styles.textContainer1}>
                            <input
                              type="checkbox"
                              className={styles.checkbox1}
                            />
                            <div className={styles.selfbook1}>Business</div>
                          </div>
                        </div>
                        <Image
                          src={iconinfo}
                          className={styles.userImagec1}
                          alt="Userinfo"
                        />
                      </div>
                    </div>
                    <hr className={styles.horizontalline} />
                    <div className={styles.dropdownContent2}>
                      <div className={styles.classText1}>Filters</div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner}>
                          <input type="checkbox" className={styles.checkbox2} />

                          <div className={styles.textContainer}>
                            <div className={styles.selfbook}>Breakfast</div>
                            <div className={styles.selfbooktext}>
                              Employees can choose hotels that offer breakfast
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner}>
                          <input type="checkbox" className={styles.checkbox2} />
                          <div className={styles.textContainer}>
                            <div className={styles.selfbook}>Lunch</div>
                            <div className={styles.selfbooktext}>
                              Employees can choose hotels that offer Lunch
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.dropdownSubContent}>
                        <div className={styles.dropdownContentInner}>
                          <input type="checkbox" className={styles.checkbox2} />
                          <div className={styles.textContainer}>
                            <div className={styles.selfbook}>Dinner</div>
                            <div className={styles.selfbooktext}>
                              Employees can choose hotels that offer Dinner
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr className={styles.horizontalline} />
                    <div className={styles.datecontainer1}>
                      <div className={styles.dateText}>Date change</div>
                      <div className={styles.datecontainer}>
                        <label className={styles.checkboxContainer}>
                          <input type="checkbox" className={styles.checkbox4} />
                          <span className={styles.checkmark}></span>
                          Allow employees to change the date
                        </label>
                        <label className={styles.checkboxContainer}>
                          <input type="checkbox" className={styles.checkbox4} />
                          <span className={styles.checkmark}></span>
                          Don’t Allow employees to change the date
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* booking window */}

            {isContentVisible1 && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectorflight}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>
                        Booking Window
                      </div>
                      <div className={styles.eligibilitysubtext}>
                        Booking Timeframe: There{"'"}s a time limit for booking
                        hotels within policy
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand9}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded9 ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded9 && (
                  <div className={styles.dropdownContent6}>
                    <div style={{ display: "flex" }}>
                      <div class="w-full mt-5" style={{ marginRight: "40px" }}>
                        <div class="relative w-full min-w-[50px] h-10">
                          <input
                            class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                            placeholder=" "
                          />
                          <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                            {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                            From
                          </label>
                        </div>
                      </div>

                      <div class="w-full mt-5" style={{ marginRight: "40px" }}>
                        <div class="relative w-full min-w-[50px] h-10">
                          <input
                            class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                            placeholder=" "
                          />
                          <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                            {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                            To
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* booking notification */}
            {isContentVisible1 && (
              <div className={styles.eligibilitycontainer}>
                <div className={styles.eligibitysubcontainer}>
                  <div className={styles.eligibility}>
                    <Image
                      src={vectorflight}
                      className={styles.userImage}
                      alt="User"
                    />
                    <div>
                      <div className={styles.eligibilitytext}>
                        Booking Notification
                      </div>
                      <div className={styles.eligibilitysubtext1}>
                        Notifying booking to approvers while booking flights
                      </div>
                    </div>
                  </div>
                  <div className={styles.arrow} onClick={toggleExpand1}>
                    <FontAwesomeIcon
                      className={styles.careticon}
                      icon={isExpanded1 ? faCaretUp : faCaretDown}
                    />
                  </div>
                </div>
                {isExpanded1 && (
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div>
                          <div className={styles.bookingnotify}>
                            Domestic Stay
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>None</div>
                              <div className={styles.selfbooktext}>
                                Approvers won’t be notified in any bookings{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                Out-Of-Policy
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in out-of-policy
                                bookings only{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                All Bookings
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in all kind of
                                bookings{" "}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage2}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div>
                          <div className={styles.bookingnotify}>
                            International Stay
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>None</div>
                              <div className={styles.selfbooktext}>
                                Approvers won’t be notified in any bookings{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                Out-Of-Policy
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in out-of-policy
                                bookings only{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                All Bookings
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in all kind of
                                bookings{" "}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage3}
                        alt="Userinfo"
                      />
                    </div>
                    <div className={styles.dropdownSubContent}>
                      <div className={styles.dropdownContentInner}>
                        <div>
                          <div className={styles.bookingnotify}>Local Stay</div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>None</div>
                              <div className={styles.selfbooktext}>
                                Approvers won’t be notified in any bookings{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                Out-Of-Policy
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in out-of-policy
                                bookings only{" "}
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ display: "flex", marginBottom: "10px" }}
                          >
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                            />
                            <div className={styles.textContainer}>
                              <div className={styles.selfbook}>
                                All Bookings
                              </div>
                              <div className={styles.selfbooktext}>
                                Approvers will be notified in all kind of
                                bookings{" "}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Image
                        src={iconinfo}
                        className={styles.userImage1}
                        alt="Userinfo"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={styles.globalcontainer1}>
              <div
                style={{
                  width: "300px",
                  marginBottom: "10px",
                  marginLeft: "10px",
                }}
              >
                <div class="w-full mt-5">
                  <div class="relative w-full min-w-[50px] h-10">
                    <input
                      class="peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                      placeholder=" "
                    />
                    <label class="flex w-full h-full select-none pointer-events-none absolute left-0 font-normal !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                      {/* <FontAwesomeIcon icon={faIndianRupeeSign} class="text-blue-gray-300 mr-1 text-xs" /> */}
                      Edit the name
                    </label>
                  </div>
                </div>
              </div>
              <div className={styles.middlecontainer}>
                <div className={styles.CreateText}>
                  Select the options to map against travel policies
                </div>
                <div className={styles.CreateText1}>
                  This will align your travel policy to these selected option
                </div>
              </div>
              <div className={styles.lastcontainer}>
                <div className={styles.companyType}>
                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters} onClick={toggleDropdown}>
                      Department
                    </p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={isDropdownOpen ? faCaretUp : faCaretDown}
                    />
                  </label>

                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters} onClick={toggleDropdown1}>
                      Designation
                    </p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={isDropdownOpen1 ? faCaretUp : faCaretDown}
                    />
                  </label>

                  {isDropdownOpen && (
                    <div className={styles.dropdownContentbd}>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Sales}
                          onChange={() => handleOptionClick("Sales")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Sales" ? styles.selected : ""
                          }`}
                          onClick={() => handleOptionClick("Sales")}
                        >
                          Sales
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Marketing}
                          onChange={() => handleOptionClick("Marketing")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Marketing"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Marketing")}
                        >
                          Software
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Engineering}
                          onChange={() => handleOptionClick("Engineering")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Engineering"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Engineering")}
                        >
                          Operations
                        </span>
                      </div>
                    </div>
                  )}

                  {isDropdownOpen1 && (
                    <div className={styles.dropdownContent12}>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Sales}
                          onChange={() => handleOptionClick("Sales")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Sales" ? styles.selected : ""
                          }`}
                          onClick={() => handleOptionClick("Sales")}
                        >
                          Director
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Marketing}
                          onChange={() => handleOptionClick("Marketing")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Marketing"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Marketing")}
                        >
                          Manager
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Engineering}
                          onChange={() => handleOptionClick("Engineering")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Engineering"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Engineering")}
                        >
                          Executive
                        </span>
                      </div>
                    </div>
                  )}

                  {isDropdownOpen2 && (
                    <div className={styles.dropdownContent21}>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Sales}
                          onChange={() => handleOptionClick("Sales")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Sales" ? styles.selected : ""
                          }`}
                          onClick={() => handleOptionClick("Sales")}
                        >
                          Level A
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Marketing}
                          onChange={() => handleOptionClick("Marketing")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Marketing"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Marketing")}
                        >
                          Level B
                        </span>
                      </div>
                      <div className={styles.dropdownItem}>
                        <input
                          type="checkbox"
                          className={styles.checkboxi}
                          checked={checkboxes.Engineering}
                          onChange={() => handleOptionClick("Engineering")}
                        />
                        <span
                          className={`${styles.option} ${
                            selectedOption === "Engineering"
                              ? styles.selected
                              : ""
                          }`}
                          onClick={() => handleOptionClick("Engineering")}
                        >
                          Level C
                        </span>
                      </div>
                    </div>
                  )}

                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters} onClick={toggleDropdown2}>
                      Level
                    </p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={isDropdownOpen2 ? faCaretUp : faCaretDown}
                    />
                  </label>

                  <label className={styles.checkboxContainercreate}>
                    <input type="checkbox" className={styles.checkbox4} />
                    <span className={styles.checkmark}></span>
                    <p className={styles.parameters}>Employee</p>
                    <FontAwesomeIcon
                      className={styles.careticon1}
                      icon={faCaretDown}
                    />
                  </label>
                </div>
                <div className={styles.cancelandsavecontainer}>
                  <button className={styles.cancelbutton}>Cancel</button>
                  <button className={styles.savebutton}>Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Travelpolicy;
