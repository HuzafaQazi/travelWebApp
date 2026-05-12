import style from "./style.module.css";
import Image from "next/image";
import gallery from "../../../../public/img/1 908931.png";
import gallery1 from "../../../../public/img/1 908932.png";
import gallery2 from "../../../../public/img/1 908933.png";
import gallery3 from "../../../../public/img/1 908934.png";
import mobgallery from "../../../../public/img/1 908931 (1).png";
import mobgallery1 from "../../../../public/img/1 908932 (1).png";
import mobgallery2 from "../../../../public/img/1 908933 (1).png";
import mobgallery3 from "../../../../public/img/1 908934 (1).png";
import map from "../../../../public/img/image 115.png";
import line from "../../../../public/img/Line 160.png";
import line1 from "../../../../public/img/Line 163.png";
import line2 from "../../../../public/img/Line 164.png";
import phone from "../../../../public/img/phone.png";
import Chat from "./chatBot/chatbot";
import { useState, useRef } from "react";

const Converge = () => {
  const [activeTab, setActiveTab] = useState("day1");

  const day1Ref = useRef(null);
  const day2Ref = useRef(null);
  const day3Ref = useRef(null);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName); // Update state when a tab is clicked
    if (tabName === "day1" && day1Ref.current) {
      day1Ref.current.scrollIntoView({ behavior: "smooth" });
    } else if (tabName === "day2" && day2Ref.current) {
      day2Ref.current.scrollIntoView({ behavior: "smooth" });
    } else if (tabName === "day3" && day3Ref.current) {
      day3Ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className={style.container}>
        <div className={style.container1}>
          <div className={style.leftcontainer}>
            <div className={style.Description}>
              Welcome to Converge 2024, The Posiflex Partner Meet at Aamby
              Valley, Lonavala! We are excited to connect and collaborate with
              you all. This app is your one-stop shop for networking, scheduling
              meetings, and exploring the exciting agenda. Get ready for an
              unforgettable event!
            </div>
            <div className={style.galleryContainer}>
              <div>
                <Image src={gallery} alt="Profile" className={style.gallery} />
              </div>
              <div className={style.galleryContainer1}>
                <div>
                  <Image
                    src={gallery1}
                    alt="Profile"
                    className={style.gallery}
                  />
                </div>
                <div className={style.galleryContainer2}>
                  <Image
                    src={gallery2}
                    alt="Profile"
                    className={style.gallery}
                  />
                  <Image
                    src={gallery3}
                    alt="Profile"
                    className={style.gallery}
                  />
                </div>
              </div>
            </div>

            <div className={style.mobGallery}>
              <div>
                <Image
                  src={mobgallery}
                  alt="Profile"
                  className={style.gallery3}
                />
              </div>
              <div className={style.mobGallery1}>
                <Image
                  src={mobgallery1}
                  alt="Profile"
                  className={style.gallery2}
                />
                <Image
                  src={mobgallery2}
                  alt="Profile"
                  className={style.gallery2}
                />
                <Image
                  src={mobgallery3}
                  alt="Profile"
                  className={style.gallery2}
                />
              </div>
            </div>
            <div className={style.Time}>Hours</div>
            <div className={style.date}>
              Date:{" "}
              <span className={style.dateText}>22nd - 24th July, 2024</span>{" "}
            </div>
            <div className={style.Location}>Event location</div>

            <div>
              <Image src={map} alt="Profile" className={style.map} />
            </div>
            <div className={style.Location1}>Aamby Valley City in Lonavala</div>
            <div>
              {" "}
              <a
                href="https://maps.app.goo.gl/Gb9kb3LMRByP16s77"
                target="_blank"
                rel="noopener noreferrer"
                className={style.link}
              >
                https://maps.app.goo.gl/Gb9kb3LMRByP16s77
              </a>
            </div>
          </div>
          <div className={style.rightcontainer}>
            <div className={style.chatcontainer}>
              {" "}
              <Chat />
            </div>
            <div className={style.about}>About Posiflex</div>
            <div className={style.aboutsub}>
              Posiflex has been a leading innovator in the industry since its
              inception in 1984. We are dedicated to providing the finest POS
              solutions and other peripherals that empower businesses to achieve
              operational excellence. Our unwavering commitment to customer
              focus remains the cornerstone of our success.
            </div>
            <div className={style.contact}>Posiflex Contact info</div>
            <div className={style.contactN}>
              <Image src={phone} alt="Profile" className={style.smileicon1} />
              <div>
                <a className={style.contactN1} href="tel:+91 7892 276 770">
                  +91 98800 42715
                </a>
                <a className={style.contactN1} href="tel:+91 9663 849 050">
                  +91 78922 76770
                </a>
              </div>
            </div>

            <div className={style.contact}>Transfer Details queries</div>
            <div className={style.contactN}>
              <Image src={phone} alt="Profile" className={style.smileicon1} />
              <div>
                <a className={style.contactN1} href="tel:+91 7892 276 770">
                  +91 74119 40703
                </a>
                <a className={style.contactN1} href="tel:+91 9663 849 050">
                  +91 80881 33172
                </a>
                <a className={style.contactN1} href="tel:+91 9663 849 050">
                  +91 90041 28252
                </a>
              </div>
            </div>

            <div className={style.contact}> For Venue/Hotel Queries</div>
            <div className={style.contactN}>
              <Image src={phone} alt="Profile" className={style.smileicon1} />
              <div>
                <a className={style.contactN1} href="tel:+91 7892 276 770">
                  +91 96638 49050
                </a>
                <a className={style.contactN1} href="tel:+91 9663 849 050">
                  +91 72041 86969
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className={style.bottomcontainer}>
          <div className={style.iternaryHeading}>Event Itinerary</div>
          <div className={style.dayText}>
            <div className={style.tabHeadings}>
              <div
                className={`${style.heading} ${
                  activeTab === "day1" ? style.activeHeading : ""
                }`}
                onClick={() => handleTabClick("day1")}
              >
                Day 1
              </div>
              <div
                className={`${style.heading} ${
                  activeTab === "day2" ? style.activeHeading : ""
                }`}
                onClick={() => handleTabClick("day2")}
              >
                Day 2
              </div>
              <div
                className={`${style.heading} ${
                  activeTab === "day3" ? style.activeHeading : ""
                }`}
                onClick={() => handleTabClick("day3")}
              >
                Day 3
              </div>
            </div>
          </div>
          <div className={style.Imagecontainer}>
            <div className={style.images2} ref={day1Ref}>
              <div className={style.dateandday}>
                Day 1 - Arrival & Welcome Dinner - 22nd July, 24
              </div>
              <div className={style.lineimage}>
                <Image src={line} alt="Profile" className={style.line} />

                <div className={style.textContainer}>
                  <div className={style.iternarytext}>
                    11:45 am - 1:00 pm (Duration - 1:15 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Check-in (Aamby Auditorium)
                  </div>
                  <div className={style.iternarytext}>
                    1:00 pm - 3:00 pm (Duration - 2:00 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Lunch (Aamby Auditorium, Pre-Function Area)
                  </div>
                  <div className={style.iternarytext}>
                    3:00 pm - 6:00 pm (Duration - 3:00 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Rest/leisure- For Partners & Family (Aussie Chalet)
                  </div>
                  <div className={style.iternarytext}>
                    6:00 pm - 7:00 pm (Duration - 1:00 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Product Demonstration (Aamby Auditorium Pre function Area)
                  </div>
                  <div className={style.iternarytext}>
                    7:00 pm - 10:30 pm (Duration - 3:30 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Welcome Dinner (Aamby Auditorium)
                  </div>

                  <div className={style.iternarytext}>Dress Code</div>
                  <div className={style.iternarytext1}>
                    For Welcome Dinner , Indian Ethnic wear with comfortable
                    shoes or sandals
                  </div>
                  <div className={style.iternarytext1}>
                    Being Rainy season , we advice to carry raincoats and
                    umbrella
                  </div>
                </div>
              </div>
            </div>
            <div className={style.images2} ref={day2Ref}>
              <div className={style.dateandday}>
                Day 2 - Business Conference & Gala Dinner Partner - 23rd July,
                24
              </div>
              <div className={style.lineimage}>
                <Image src={line1} alt="Profile" className={style.line} />
                <div className={style.textContainer}>
                  <div className={style.iternarytext}>
                    7:30 am - 8:45 am (Duration - 1:15 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Breakfast (Woodpecker Restaurant)
                  </div>
                  <div className={style.iternarytext}>
                    8:45 am - 9:00 am (Duration - 00:15 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Arrival & Registration (Aamby Auditorium Pre Function Area)
                  </div>
                  <div className={style.iternarytext}>
                    9:00 am - 1:00 pm (Duration - 4:00 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Business Presentation (Aamby Auditorium)
                  </div>
                  <div className={style.iternarytext}>
                    1:00 pm - 2:00 pm (Duration - 1:00 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Lunch (Aamby Auditorium)
                  </div>
                  <div className={style.iternarytext}>
                    2:00 pm - 4:30 pm (Duration - 2:30 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Business Presentation (Aamby Auditorium)
                  </div>
                  <div className={style.iternarytext}>
                    4:30 pm- 6:30 pm (Duration - 2:00 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Break (Aamby Auditorium)
                  </div>
                  <div className={style.iternarytext}>
                    6:30 pm- 11:30 pm (Duration - 5:00 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Gala Dinner (Aamby Auditorium)
                  </div>

                  <div className={style.iternarytext}>Dress Code</div>
                  <div className={style.iternarytext1}>
                    For Business Conference : Business Formals Collared
                    shirt/Tshirts with appropriate trousers Blazers (optional),
                    Dress shoes
                  </div>
                  <div className={style.iternarytext1}>
                    For Gala Dinner: Party Wear with comfortable shoes or
                    sandals
                  </div>
                  <div className={style.iternarytext1}>
                    Considering Rainy season , we advice to carry raincoats and
                    umbrella
                  </div>
                </div>
              </div>
            </div>
            <div className={style.images2} ref={day2Ref}>
              <div className={style.dateandday}>
                Day 2 - Business Conference & Gala Dinner For Family - 23rd
                July, 24
              </div>
              <div className={style.lineimage}>
                <Image src={line1} alt="Profile" className={style.line} />
                <div className={style.textContainer}>
                  <div className={style.iternarytext}>
                    7:30 am - 9:45 am (Duration - 2:15 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Breakfast at Woodpecker Restaurant
                  </div>
                  <div className={style.iternarytext}>
                    9:45 am - 10:00 am (Duration - 00:15 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Arrival & Registration (Aamby Auditorium Pre Function Area)
                  </div>
                  <div className={style.iternarytext}>
                    10:00 am - 1:30 pm (Duration - 3:30 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Aamby Water Safari (Aamby Auditorium)
                  </div>
                  <div className={style.iternarytext}>
                    1:30 pm - 4:00 pm (Duration - 2:30 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Lunch (Aamby Auditorium)
                  </div>
                  <div className={style.iternarytext}>
                    4:00 pm - 6:30 pm (Duration - 2:30 hr)
                  </div>
                  <div className={style.iternarytext1}>Break</div>
                  <div className={style.iternarytext}>
                    6:30 pm- 11:30 pm (Duration - 5:00 hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Gathering (Aamby Auditorium)
                  </div>

                  <div className={style.iternarytext}>Dress Code</div>
                  <div className={style.iternarytext1}>
                    For Aamby Water Safari :Proper casual attire, Track Suits,
                    Raincoat, T-Shirt, Shorts, Sports Shoes or Anti Skid
                    Sandals.
                  </div>
                  <div className={style.iternarytext1}>
                    For Gala Dinner: Party Wear with comfortable shoes or
                    sandals
                  </div>
                  <div className={style.iternarytext1}>
                    Being Rainy season , we advice to carry raincoats and
                    umbrella
                  </div>
                </div>
              </div>
            </div>
            <div className={style.images1} ref={day3Ref}>
              <div className={style.dateandday}>
                Day 3 - Checkout 24th July, 24
              </div>
              <div className={style.lineimage}>
                <Image src={line2} alt="Profile" className={style.line} />
                <div className={style.textContainer}>
                  <div className={style.iternarytext}>
                    7:30 am - 9:45am (Duration - 2:30 Hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Breakfast at woodpecker’s restaurant
                  </div>
                  <div className={style.iternarytext}>
                    9:45 am - 11:30 am (Duration - 1:45 Hr)
                  </div>
                  <div className={style.iternarytext1}>Rest/leisure</div>
                  <div className={style.iternarytext}>
                    11:30 am - 1:30 pm (Duration - 2:00 Hr)
                  </div>
                  <div className={style.iternarytext1}>
                    Checkout at Reception
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={style.iternarytext}>Disclaimer</div>
        <div className={style.iternarytext1} style={{ width: "100%" }}>
          “Please note that the agenda is subject to change based on unforeseen
          circumstances or to better accommodate the needs of the event. We will
          make every effort to communicate any significant changes in a timely
          manner. Thank you for your understanding and flexibility.”
        </div>
      </div>
    </>
  );
};

export default Converge;
