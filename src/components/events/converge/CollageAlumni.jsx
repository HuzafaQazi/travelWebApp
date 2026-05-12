import style from "./style.module.css";
import Image from "next/image";
import first from "../../../../public/img/event/Facade_b6nuhg.webp";
import second from "../../../../public/img/event/Pool01_edez1l.webp";
import third from "../../../../public/img/event/O_Caffe_tglnpu.webp";
import fourth from "../../../../public/img/event/Lounge_4_icjpxt.webp";
import map from "../../../../public/img/event/image (8).png";
import line from "../../../../public/img/Line 160.png";
import line1 from "../../../../public/img/Line 163.png";
import line2 from "../../../../public/img/Line 164.png";
import phone from "../../../../public/img/phone.png";
import Chat from "./chatBot/chatbot";
import { useState, useRef } from "react";
import Poem from "./Poem"

const Converge = () => {
  const [activeTab, setActiveTab] = useState("day1");

  const day1Ref = useRef(null);
  const day2Ref = useRef(null);
  const day3Ref = useRef(null);
  const day4Ref = useRef(null);
  const day5Ref = useRef(null);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName); // Update state when a tab is clicked
    if (tabName === "day1" && day1Ref.current) {
      day1Ref.current.scrollIntoView({ behavior: "smooth" });
    } else if (tabName === "day2" && day2Ref.current) {
      day2Ref.current.scrollIntoView({ behavior: "smooth" });
    } else if (tabName === "day3" && day3Ref.current) {
      day3Ref.current.scrollIntoView({ behavior: "smooth" });
    }
    else if (tabName === "day4" && day4Ref.current) {
      day4Ref.current.scrollIntoView({ behavior: "smooth" });
    }
    else if (tabName === "day5" && day5Ref.current) {
      day5Ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className={style.container}>
        <div className={style.container1}>
          <div className={style.leftcontainer}>
            <div className={style.Description}>
              கருவறை வாழ்க்கை ஒன்பது மாதம் - நம் கல்லூரி வாழ்க்கை ஆறெட்டு மாதம்.
              மீண்டும் கருவறை பயணம் -
              சமூக ஆடைகள் களைந்து
              நிஜமான நம்மை உணர.
              கிளைகள் எங்கோ படர்ந்தாலும் , வேரோடு உறவாட சில நாட்கள்
              நரை படர்ந்த நிகழ்வுகளை துறந்து , மீண்டும் வாலிப வாசம்
              இரை தேடி பயணிக்கும் பறவைகளாய் , நட்பின் துணை தேடி பயணிப்போம்
              நிகழ்வுகள் நுகர்ந்திடுவோம் , இன்னும் சில ஆண்டு சுகமாக அசை போட
            </div>

            <div className="ml-0 mr-2 my-2" >
              <Poem />

            </div>
            <div className=" hidden sm:flex  w-full max-w-4xl mx-auto gap-2">
              {/* Left Side - Large Image */}
              <div className="w-1/2">
                <Image
                  src={first}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Right Side - Split into two rows */}
              <div className="w-1/2 flex flex-col gap-2">
                {/* Top Row - Single Image */}
                <div className="w-full">
                  <Image
                    src={second}
                    alt="Profile"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Bottom Row - Two Images */}
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <Image
                      src={third}
                      alt="Profile"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="w-1/2">
                    <Image
                      src={fourth}
                      alt="Profile"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:hidden flex flex-col w-full max-w-md mx-auto gap-2">
              {/* Top Image - Larger */}
              <div className="w-full">
                <Image
                  src={first}
                  alt="Profile"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Bottom Row - Three Smaller Images */}
              <div className="flex gap-2">
                <div className="w-1/3">
                  <Image
                    src={second}
                    alt="Profile"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
                <div className="w-1/3">
                  <Image
                    src={third}
                    alt="Profile"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
                <div className="w-1/3">
                  <Image
                    src={fourth}
                    alt="Profile"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
            {/* <div className={style.Time}>Hours</div>
            <div className={style.date}>
              Date: <span className={style.dateText}>4th - 6th July, 2025</span>{" "}
            </div> */}
            <div className={style.Location}>Event location</div>

            <div>
              <Image src={map} alt="Profile" className={style.map} />
            </div>
            <div className={style.Location1}>O By Tamara Coimbatore</div>
            <div>
              {" "}
              <a
                href="https://maps.app.goo.gl/9rGRP9DEK2Twt7Se9"
                target="_blank"
                rel="noopener noreferrer"
                className={style.link}
              >
                https://maps.app.goo.gl/9rGRP9DEK2Twt7Se9
              </a>
            </div>
          </div>
          <div className={style.rightcontainer}>
            <div className={style.chatcontainer}>
              {" "}
              <Chat />
            </div>
            {/* <div className={style.contact}>Posiflex Contact info</div>
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
            </div> */}

            <div className={style.contact}>For Event related</div>
            <div className={style.contactN}>
              <Image src={phone} alt="Profile" className={style.smileicon1} />
              <div>
                <div className="flex">
                  <span>Ramesh :</span>
                  <a className={style.contactN1} href="tel:+91 9600418111">
                    9600418111
                  </a>
                </div>
                <div className="flex">
                  <span>Basky : </span>
                  <a className={style.contactN1} href="tel:+91 9880042702">
                    9880042702
                  </a>
                </div>
                <div className="flex">
                  <span>Selva: </span>
                  <a className={style.contactN1} href="tel:+91 703 568 3543">
                    +1 703 568 3543
                  </a>
                </div>
              </div>
            </div>

            <div className={style.contact}> For Hotel/Transfers/Bookings/Cancellation Related</div>
            <div className={style.contactN}>
              <Image src={phone} alt="Profile" className={style.smileicon1} />
              <div>
                <div className="flex">
                  <span>Venisha: </span>
                  <a className={style.contactN1} href="tel:+91 7411 940 703">
                    +91 7411 940 703
                  </a>
                </div>
                <a className={style.contactN1} href="mailto:venishadyafni@qugo.io">
                  venishadyafni@qugo.io
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
                className={`${style.heading} ${activeTab === "day1" ? style.activeHeading : ""
                  }`}
                onClick={() => handleTabClick("day1")}
              >
                Day 1
              </div>
              <div
                className={`${style.heading} ${activeTab === "day2" ? style.activeHeading : ""
                  }`}
                onClick={() => handleTabClick("day2")}
              >
                Day 2
              </div>
              <div
                className={`${style.heading} ${activeTab === "day3" ? style.activeHeading : ""
                  }`}
                onClick={() => handleTabClick("day3")}
              >
                Day 3
              </div>
              {/* <div
                className={`${style.heading} ${activeTab === "day4" ? style.activeHeading : ""
                  }`}
                onClick={() => handleTabClick("day4")}
              >
                Day 4
              </div>
              <div
                className={`${style.heading} ${activeTab === "day5" ? style.activeHeading : ""
                  }`}
                onClick={() => handleTabClick("day5")}
              >
                Day 5
              </div> */}
            </div>
          </div>
          <div className="bg-[#3f269f0a] flex-col sm:flex sm:flex-row rounded-[10px] ">
            <div className={style.images2} ref={day1Ref}>
              <div className={style.dateandday}>
                Day 1 – July 4, 2025 (Friday) <br />
                Theme: Reunite & Reconnect<br />
                Venue: O by Tamara Hotel
              </div>
              <div className={style.lineimage}>
                <Image src={line} alt="Profile" className={style.line} />

                <div className={style.textContainer}>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    12:00 PM onwards – Check-in Opens
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Arrival, room allotment & welcome kit distribution</li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    01:00 PM – 03:00 PM – Meet & Greet Session
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Ice-breaker activities, reconnecting with friends </li>
                    <li>Venue: Hotel Lobby Area </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    03:30 PM – 06:30 PM – Leisure Time (Optional Sightseeing at Own Cost)
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Marudhamalai Temple (Spiritual & Scenic)</li>
                    <li>Isha Yoga Centre (By personal arrangements) </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    07:30 PM – 10:30 PM – Ice-breaker & Cocktail Dinner
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Fun games, music, and dance </li>
                    <li>Venue: Hotel Banquet Hall</li>
                  </ul>
                </div>

              </div>
            </div>
            <div className={style.images2} ref={day2Ref}>
              <div className={style.dateandday}>
                Day 2 – July 5, 2025 (Saturday) <br />
                Theme: Explore & Entertain <br />
                Venue: O by Tamara Hotel
              </div>
              <div className={style.lineimage}>
                <Image src={line1} alt="Profile" className={style.line} />
                <div className={style.textContainer}>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f]">
                    08:00 AM – 10:00 AM – Breakfast (for hotel guests)
                  </div>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    12:00 Noon onwards – Check-in Continues
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>For members arriving on Day 2  </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f]">
                    10:00 AM – 03:00 PM – Optional Sightseeing at Own Cost (Leisure Time)
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Gedee Car Museum / Isha Temple / Shopping </li>
                    {/* <li>(Detailed options will be shared closer to the event)  </li> */}
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    11:00 AM – 05:00 PM – Chit Chat Zone
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Casual hangout at hotel lobby  </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    05:00 PM – 06:30 PM – Tattoo Artist & Mehendi (Optional at your own cost)
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Details to be shared later </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    06:30 PM onwards – Gala Cocktail Theme Dinner
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>DJ night, karaoke, games, and batch storytelling </li>
                    <li>Dress Code: Will be communicated prior</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className={style.images2} ref={day3Ref}>
              <div className={style.dateandday}>
                Day 3 – July 6, 2025 (Sunday) <br />
                Theme: Celebrate & Cherish <br />
                Venue: College Campus
              </div>
              <div className={style.lineimage}>
                <Image src={line1} alt="Profile" className={style.line} />
                <div className={style.textContainer}>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f]">
                    08:00 AM – 09:30 AM – Breakfast
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>At College / Hotel for guests at O by Tamara </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    Before 09:30 AM – Hotel Check-Out & Bus Departure to College
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Transport arranged for all participants  </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f]">
                    09:30 AM – Registration at College
                  </div>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f]">
                    10:00 AM – 10:30 AM – Group Photo Session
                  </div>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f]">
                    10:30 AM – 12:30 PM – Official Pearl Jubilee Ceremony
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Welcome address </li>
                    <li>Faculty & dignitary speeches  </li>
                    <li>Alumni felicitation </li>
                    <li>A journey down memory lane (Detailed agenda will follow) </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    12:30 PM – 01:30 PM – Campus Tour
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li> Revisiting classrooms, labs, and shared spaces </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    01:30 PM – 02:30 PM – Special Lunch
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Venue: College Hostel Mess  </li>
                  </ul>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    03:00 PM – 04:00 PM – Optional Hostel Tour & Photo Collection
                  </div>
                  <ul className="list-disc pl-5 text-[#3f269f] text-gray-800 mb-[7.5%]">
                    <li>Group photo frame distribution by event coordinators </li>
                  </ul>
                  <div className="mt-[4%]  font-inter text-[16px] font-bold leading-[19.36px] text-left text-[#3f269f] ">POST-EVENT: Optional Leisure Stay</div>
                  <div className="mt-[2%]  font-inter text-[16px] font-semibold leading-[19.36px] text-left text-[#3f269f] ">
                    📍Venue: SR Jungle Resort, Anaikatti <br />
                    🚌 Departure: 4:30 PM (From College Campus) <br />
                    📅 Stay: July 6–7, 2025<br />
                    📌 Note: Separate booking and payment required<br />
                    🎯 Tour Coordinators: Rajendran / Selvapandian
                  </div>

                </div>
              </div>
            </div>
            {/* <div className={style.images1} ref={day4Ref} >
              <div className={style.dateandday}>
                Day 4 – July 7th
              </div>
              <div className={style.lineimage}>
                <Image src={line2} alt="Profile" className={style.line} />
                <div className={style.textContainer}>
                  <div className={style.iternarytext1}>
                    Ooty/Coonoor
                  </div>
                </div>
              </div>
            </div>
            <div className={style.images1} ref={day5Ref} >
              <div className={style.dateandday}>
                Day 5 – July 8th
              </div>
              <div className={style.lineimage}>
                <Image src={line2} alt="Profile" className={style.line} />
                <div className={style.textContainer}>
                  <div className={style.iternarytext1}>
                    Ooty/Coonoor
                  </div>
                </div>
              </div>
            </div> */}
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
