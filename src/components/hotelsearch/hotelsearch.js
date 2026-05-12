import Image from "next/image";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import qugologo from "../../images/qugoLogo.png";

const inter = Inter({ subsets: ["latin"] });

export default function HotelSearch() {
  return (
    <>
      <div>
        {/* <Header /> */}
        <div className={style.hotelSearchMainDiv}>
          <div className={style.container}>
            <div id={style.banner} className=" align-items-center">
              <Image
                className={style.qugoLogo}
                src={qugologo}
                alt="Qugo Logo"
              />
            </div>
          </div>
          <div className={`${style.container} ${style.search}`}>
            <div id="hotelSearch" className="hotelSearch">
              <div className={`container ${style.searchButtons}`}>
                <button
                  className={`${style.searchButton} ${style.searchHotelButton}`}
                >
                  Hotels
                </button>
                <button className={style.searchButton}>Flights</button>
                <button className={style.searchButton}>Packages</button>
              </div>
              <div className="container">
                <div className="row">
                  <div className="col-lg-12  align-items-stretch">
                    <div className={style.searchHotels}>
                      <div className="container">
                        <div className={`row ${style.tableRow}`}>
                          <div
                            className={`col-xl-4  align-items-stretch ${style.citySearch}`}
                          >
                            <div className="icon-box mt-4 mt-xl-0">
                              <i className="bx bx-cube-alt"></i>
                              <p className={style.searchHeadingFont}>
                                DESTINATION
                              </p>
                              <p className={style.cityName}>Vishakhapatnam</p>
                            </div>
                          </div>
                          <div
                            className={`col-xl-5  align-items-stretch ${style.citySearch}`}
                          >
                            <div className="row">
                              <div className="col-xl-6  align-items-stretch">
                                <div className="icon-box mt-2 mt-xl-0">
                                  <i className="bx bx-cube-alt"></i>
                                  <p className={style.searchHeadingFont}>
                                    CHECK-IN
                                  </p>
                                  <p className={style.searchDate}>
                                    12th April, 2023
                                  </p>
                                  <p className={style.searchDay}>Saturday</p>
                                </div>
                              </div>
                              <div className="col-xl-6  align-items-stretch">
                                <div className="icon-box mt-2 mt-xl-0">
                                  <i className="bx bx-cube-alt"></i>
                                  <p className={style.searchHeadingFont}>
                                    CHECK-OUT
                                  </p>
                                  <p className={style.searchDate}>
                                    18th April, 2023
                                  </p>
                                  <p className={style.searchDay}>Saturday</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={`col-xl-3  align-items-stretch`}>
                            <div className="icon-box mt-4 mt-xl-0">
                              <i className="bx bx-cube-alt"></i>
                              <p className={style.searchHeadingFont}>
                                ROOMS & GUESTS
                              </p>
                              <p className={style.searchPax}>
                                1 Room | 2 Guests
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="container">
                        <div className={style.hotelSearchButton}>
                          <div>
                            <FontAwesomeIcon
                              className={style.hotelSearchIcon}
                              icon={faSearch}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
