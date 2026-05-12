import styles from "./styles.module.css";
import Image from "next/image";
import Laptopimg from "../../../../public/img/corporate/laptopimg.png";
import Solution1img from "../../../../public/img/corporate/solution1img.png";
import Solution2img from "../../../../public/img/corporate/solutionimg2.png";
import Spendtravel from "../../../../public/img/corporate/spendtravel.png";
import Implement from "../../../../public/img/corporate/implementimg.png";
import Maleimg from "../../../../public/img/corporate/maleimg.png";
import Femaleimg from "../../../../public/img/corporate/femaleimg.png";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";
import Header from "@/components/corporate/auth/Header";

export default function Solution() {
  const [isChecked, setIsChecked] = useState(false);
  const router = useRouter();

  const handleToggle = () => {
    setIsChecked(!isChecked);
  };

  const goToSolution = () => {
    router.push("/solution");
  };
  const goToAbout = () => {
    router.push("aboutpage");
  };

  return (

    <div className={styles.entrie}>

      <div className="w-full h-full bg-[#FFFFFF]">
        <Header />
      </div>
      {/* {qugo corporate all in one} */}
      <div className={styles.navbar2}>
        <div className={styles.allinonecontainer}>
          <div>
            <div className={styles.crpallinone}>
              QuGo.Corporate
              <br />
              ALL-IN ONE
            </div>
            <div className={styles.industry}>Travel and spending management are <br />
              made easy with QuGo
            </div>
          </div>
          <div>
            <Image
              src={Laptopimg}
              alt="laptop Logo"
              className={styles.laptopimg}
            />
          </div>
        </div>
      </div>

      {/* {button for admin and employee switch toggle} */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div className={styles.buttonswitch}>
          <label className={styles.switch}>
            <input type="checkbox" checked={isChecked} onChange={handleToggle} />
            <span className={styles.slider}>
              <p className={styles.employee}>Employee</p>
            </span>
          </label>
        </div>
        <span className={styles.switchemp}>Switch to know about employee</span>
      </div>


      {/* {Seamless Onboarding of Organization} */}
      <div className={styles.navbar3}>
        <Image
          src={Solution1img}
          alt="Company Logo"
          className={styles.solution1img}
        />
        <div>
          <div className={styles.crpallinone}>
            Seamless Onboarding<br />
            of Organization
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexDirection: 'column' }}>
            <div className={styles.corporatepanel}>
              <div className={styles.setup}>
                <span className={styles.companyset}> <FontAwesomeIcon icon={faPlus} /></span>
                <span className={styles.companyset}>COMPANY SETUP</span>
              </div>
              <span className={styles.setuppanel}>Employee onboarding via the<br />
                corporate setup panel </span>
            </div>

            <div className={styles.corporatepanel}>
              <div className={styles.setup}>
                <span className={styles.companyset}> <FontAwesomeIcon icon={faPlus} /></span>
                <span className={styles.companyset}>COMPANY SETUP</span>
              </div>
              <span className={styles.setuppanel}>Employee onboarding via the<br />
                corporate setup panel </span>
            </div>
            <div className={styles.corporatepanel}>
              <div className={styles.setup}>
                <span className={styles.companyset}> <FontAwesomeIcon icon={faPlus} /></span>
                <span className={styles.companyset}>COMPANY SETUP</span>
              </div>
              <span className={styles.setuppanel}>Employee onboarding via the<br />
                corporate setup panel </span>
            </div>
          </div>
        </div>
      </div>

      {/* {travel guidelines for safety} */}
      <div className={styles.navbar4} >
        <div className="w-[93%] mt-5 sm:mt-0 sm:w-auto" style={{ display: "flex", flexDirection: "column" }}>
          <span className={styles.crpallinone}>Travel Guidelines for Safety,<br /> Efficiency, and Responsibility</span>
          <div className={styles.travelpolicy}>
            <span className={styles.industry}>Designed an in-depth travel policy to provide <br />precise and unambiguous directives</span>

            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "19px" }}>
              <div className={styles.travelbtn}>Flight</div>
              <div className={styles.travelbtn}>Hotels</div>
              <div className={styles.travelbtn}>Trip</div>
            </div>
          </div>
        </div>


        <Image
          src={Solution2img}
          alt="solutionimg"
          className={styles.solutionimg2}
        />

      </div>

      {/* {Easily comprehensible dashboard} */}
      <div className={styles.navbar5}>
        <div className="flex flex-col sm:flex-row" style={{ display: "flex" }}>

          <Image
            src={Spendtravel}
            alt="solutionimg"
            className={styles.spendtravele}
          />
          <div style={{ display: "flex", flexDirection: "column", marginTop: "8%" }}>
            <span className={styles.crpallinone}>Easily comprehensible<br /> dashboard</span>
            <div className={styles.dashbord}>
              <span className={styles.industry}>QuGo provides a unified interface that<br /> serves as a single source of truth for all<br /> company expenditures. </span>
            </div>

          </div>
        </div>
      </div>
      <div className={styles.navbar6}>

        <div className={styles.firstDiv}>
          {/* Content for the first div */}
          <div className={styles.columnContent}>
            <div>
              <div className={styles.crpallinone}>Quick and easy <br />implementation</div>
              <div className={styles.industry}>Easily comprehensible<br /> dashboard</div>
            </div>
            <div>
              <div className={styles.expense}>Expense <br />
                Management</div>
              <div className={styles.industry}>Simplest way of keeping a track of all  <br />your employee’s expenses and <br />reimbursements</div>
            </div>
          </div>
          <hr className={styles.hrLine} /> {/* Horizontal line */}
          {/* {colmns 2} */}
          <div className={styles.contentWithVerticalLine}>
            <div className={styles.mainconatinerline}>
              <div >
                <div className={styles.expense}>Users</div>
                <span className={styles.industry}>For admin & <br />
                  employees</span>
              </div>
              <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div className={styles.male}>
                  <Image
                    src={Maleimg}
                    alt="maleimg"
                    className="w-4 sm:w-10"
                  />
                </div>
                <div className={styles.female}>
                  <Image
                    src={Femaleimg}
                    alt="femaleimg"
                    className="w-4 sm:w-10"
                  />
                </div>

              </div>
            </div>

            <div className={styles.designedbussines}>
              <span className={styles.crpallinone}>Designed for Every <br />Business</span>
              <span className={styles.industry}>Micro, Small & <br />
                Medium Enterprises</span>
            </div>


          </div>
          <hr className={styles.hrLine} /> {/* Horizontal line */}
          {/* {columns 3} */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "4% 0%" }}>
            <div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div className={styles.crpallinone}>24/7 </div>
                <span className={styles.industry}>Helpful assistance during product <br />setup and training </span>
              </div>
              <div className={styles.crpallinone}>Customer Support</div>
            </div>
            <div>
              <div className={styles.expense}>Easy and functional <br />interface </div>
              <span className={styles.industry}>designed for efficient travel <br />management</span>
            </div>
          </div>
        </div>
        <div className={styles.secondDiv}>
          <Image
            src={Implement}
            alt="solutionimg"
            className={styles.implementimg}
          />
        </div>
      </div>
      <Footer1 />
    </div>
  )
}