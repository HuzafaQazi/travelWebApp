import Footer from "@/components/footer/footer";
import "bootstrap/dist/css/bootstrap.css";
import style from "./styles.module.css";
// import image7 from "../../images/Travel/Switzerland.jpg";
import GoToTopButton from "@/components/gototopbutton/gototopbutton";
import HeaderHome from "@/components/headerHome/headerHome";
import Loader from "@/components/loader/loader";
import TabTitle from "@/components/tabtitles/tabtitle";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getTabSpecificData, setTabSpecificData, removeTabSpecificData } from "@/utils/axios/axios";
import { fetchUserIp } from "../../../utils/fetchUserIP";
import CityCarousel from "../../components/indianCityCarousel/indianCityCarousel";
import OffersCarousel from "../../components/offersCarousel/offerCarousel";


export default function HomePage(props) {
  const router = useRouter();
  const {
    qTraceId,
    rooms,
    adults,
    children,
    destination,
    checkinDate,
    checkoutDate,
    getCityId,
    getCountryCode,
    getHotelCode,
    roomCountString,
    hotelLocation,
  } = router.query;

  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [searchCall,setSearchCall] = useState(false);

  const updateHotelList = (
    response,
    checkinDate,
    checkoutDate,
    destination,
    getCityId,
    getCountryCode,
    roomCountString,
    rooms,
    adults,
    children,
    hotelLocation
  ) => {
    console.log("Went into updatehotel list");
    let hotelResults = response?.hotelResults;
    setQTraceID(response?.qTraceId);
    let updatedHotels = hotelResults.map((hotelData) => {
      return {
        hotelCode: hotelData.hotelCode,
        hotelName: hotelData.hotelName,
        vendorCode: hotelData.vendorCode,
        hotelDescription: hotelData.hotelDescription,
        starRating: hotelData.starRating,
        hotelImages: hotelData.hotelImages,
        hotelAddress: hotelData.hotelAddress,
        price: {
          currencyCode: hotelData.price.currencyCode,
          roomPrice: hotelData.price.roomPrice,
          tax: hotelData.price.tax,
          extraGuestCharge: hotelData.price.extraGuestCharge,
          childCharge: hotelData.price.childCharge,
          otherCharges: hotelData.price.otherCharges,
          discount: hotelData.price.discount,
          publishedPrice: hotelData.price.publishedPrice,
          publishedPriceRoundedOff: hotelData.price.publishedPriceRoundedOff,
          offeredPrice: hotelData.price.offeredPrice,
          offeredPriceRoundedOff: hotelData.price.offeredPriceRoundedOff,
          agentCommission: hotelData.price.agentCommission,
          agentMarkUp: hotelData.price.agentMarkUp,
          serviceTax: hotelData.price.serviceTax,
          TCS: hotelData.price.TCS,
          TDS: hotelData.price.TDS,
          serviceCharge: hotelData.price.serviceCharge,
          totalGstAmount: hotelData.price.totalGstAmount,
          GST: {
            CGSTAmount: hotelData.price.GST.CGSTAmount,
            CGSTRate: hotelData.price.GST.CGSTRate,
            cessAmount: hotelData.price.GST.cessAmount,
            cessRate: hotelData.price.GST.cessRate,
            IGSTAmount: hotelData.price.GST.IGSTAmount,
            IGSTRate: hotelData.price.GST.IGSTRate,
            SGSTAmount: hotelData.price.GST.SGSTAmount,
            SGSTRate: hotelData.price.GST.SGSTRate,
            taxableAmount: hotelData.price.GST.taxableAmount,
          },
        },
      };
    });
    console.log("The length of hotels is ", hotels.length);
    setHotels(updatedHotels);

    console.log(
      "Data coming from updatelist",
      checkinDate,
      checkoutDate,
      destination,
      getCityId,
      getCountryCode,
      roomCountString,
      rooms
    );
    const queryParams = {
      checkinDate: checkinDate,
      checkoutDate: checkoutDate,
      destination: destination,
      getCityId: getCityId,
      getCountryCode: getCountryCode,
      qTraceId: response?.qTraceId,
      roomCountString: roomCountString,
      rooms: rooms,
      adults: adults,
      children: children,
      hotelLocation,
      // Add other query parameters as needed
    };

    console.log("Router query is", router.query);

    // Merge the new query parameters with the existing ones
    const updatedQueryParams = { ...router.query, ...queryParams };

    // Replace the URL without refreshing the page
    router.replace({
      pathname: router.pathname,
      query: updatedQueryParams,
    });
  };
  const clearAllFilters = () => {
    if (
      Object.values(roomPreference).some(Boolean) ||
      priceFilter !== null ||
      starFilters.length > 0
    ) {
      setRoomPreference({
        breakfast: false,
        lunch: false,
        dinner: false,
      });
      setPriceFilter(null);
      setStarFilters([]);
    }
  };

  const searchRoomCall = (value) => {
    setSearchCall(value);
  }





  const ip = props.ip;
  console.log(ip);
  const [getuserip, setuserip] = useLocalStorage("userip");
  useEffect(() => {
    const fetchData = async () => {
      try {
        let userip = await fetchUserIp();
        setTabSpecificData("userip", userip);
      } catch (error) {
        // Handle any errors that occurred during fetching the user's IP
        console.error("Error fetching user's IP:", error);
      }
    };
    fetchData(); 
  }, []);
  return (
    <>
    <TabTitle></TabTitle>     
    <GoToTopButton />
    {searchCall && <Loader/>}
       <div className="header-container" style={{ /* minWidth: "1200px", overflowX: "auto" */ width: "100%" }}>
        {/* <HotelSearchShort /> */}
        {/* <Header /> */}
        {/* <HotelSearch /> */}
        <HeaderHome 
        searchRoomCall={searchRoomCall}/>
        <div>
          <div className={style.bodyContainer}>
            {/* Packages Grid Template start */}
            <div className={style.tourPackagesGrid}>
              <div className={style.internationalTrip}>International Trips</div>
              <div className={style.gridImageTemplate}>
                <div className={style.imagecol1}>
                  {/* <Image
                    src={image6}
                    alt="Image not found"
                    className={style.columnimg1}
                  ></Image> */}
                  <div className={style.citydiv1}>Amsterdam</div>
                </div>
                <div className={style.imagecol2}>
                  <div className={style.insideimagecol1}>
                    <div className={style.insideimagecol3}>
                      {/* <Image
                        src={image2}
                        alt="Image not found"
                        className={style.columnimg2}
                      ></Image> */}
                      <div className={style.citydiv2}>Japan</div>
                    </div>
                    <div className={style.insideimagecol4}>
                      <div className={style.insideimagecol5}>
                        {/* <Image
                          src={image3}
                          alt="Image not found"
                          className={style.columnimg4}
                        ></Image> */}
                        <div className={style.citydiv3}>Abu Dhabi</div>
                      </div>
                      <div className={style.insideimagecol6}>
                        {/* <Image
                          src={image4}
                          alt="Image not found"
                          className={style.columnimg5}
                        ></Image> */}
                        <div className={style.citydiv4}>Coorg</div>
                      </div>
                    </div>
                  </div>
                  <div className={style.insideimagecol2}>
                    {/* <Image
                      src={image5}
                      alt="Image not found"
                      className={style.columnimg3}
                    ></Image> */}
                    <div className={style.citydiv4}>Maldives</div>
                  </div>
                </div>
              </div>
              <div className={style.tourTypes}>
                <div className={style.tourTypes1}>
                  <p className={style.budgetFriendly}>Budget Friendly</p>
                  <p className={style.chepestCity}>
                    Checkout cheapest international trips
                  </p>
                </div>
                <div className={style.tourTypes2}>
                  <p className={style.romantic}>Romantic</p>
                  <p className={style.romanticCity}>
                    Checkout romantic cities across the globe
                  </p>
                </div>
                <div className={style.tourTypes3}>
                  <p className={style.todo}>Things to do </p>
                  <p className={style.todoCity}>Checkout intriguing events</p>
                </div>
              </div>
              <div className={style.recommendations}>
                <div className={style.recommendationsText}>
                  <p className={style.recommendationsForYou}>
                    Other Recommendations For You{" "}
                  </p>
                  <p className={style.recommendationsCity}>
                    Malaysia |
                    <span className={style.amsterdamCity}> Amsterdam </span>|
                    Australia | Paris | Maldives | Bangkok
                  </p>
                </div>
              </div>
            </div>
            {/* Packages Grid Template end */}
            {/* promotions Carousel start */}
            <OffersCarousel />
            {/* promotions Carousel end */}
            {/* India City Packages Carousel start */}
            <div className={style.indianCityCarousel}>
              <CityCarousel />
              <div className={style.recommendations}>
                <div className={style.recommendationsText}>
                  <p className={style.recommendationsForYou}>
                    Other Recommendations For You{" "}
                  </p>
                  <p className={style.recommendationsCity}>
                    Ladakh |{" "}
                    <span className={style.amsterdamCity}>
                      Andaman and Nicobar Islands
                    </span>{" "}
                    | Kashmir | Udaipur | Mumbai | Karnataka
                  </p>
                </div>
              </div>
            </div>
            {/* India City Packages Carousel end */}

            {/* Explore Near You start*/}

            <div className={style.explore}>
              <div className={style.exploreNearYou}>Explore Near You</div>
              <div className={style.exploreCity}>
                <div className={style.exploreNearYouCity1}>
                  <p className={style.exploreCity1}>Bangalore</p>
                  <p className={style.placesCity1}>
                    Coorg . Mysuru . Ooty . Wa..
                  </p>
                </div>
                <div className={style.exploreNearYouCity1}>
                  <p className={style.exploreCity1}>Delhi</p>
                  <p className={style.placesCity1}>
                    Coorg . Mysuru . Ooty . Wa..
                  </p>
                </div>
                <div className={style.exploreNearYouCity1}>
                  <p className={style.exploreCity1}>Mumbai</p>
                  <p className={style.placesCity1}>
                    Coorg . Mysuru . Ooty . Wa..
                  </p>
                </div>
                <div className={style.exploreNearYouCity1}>
                  <p className={style.exploreCity1}>Lucknow </p>
                  <p className={style.placesCity1}>
                    Coorg . Mysuru . Ooty . Wa..
                  </p>
                </div>
                <div className={style.exploreNearYouCity1}>
                  <p className={style.exploreCity1}>Darjeeling</p>
                  <p className={style.placesCity1}>
                    Coorg . Mysuru . Ooty . Wa..
                  </p>
                </div>
                <div className={style.exploreNearYouCity1}>
                  <p className={style.exploreCity1}>Manali</p>
                  <p className={style.placesCity1}>
                    Coorg . Mysuru . Ooty . Wa..
                  </p>
                </div>
                <div className={style.exploreNearYouCity1}>
                  <p className={style.exploreCity1}>Rajasthan</p>
                  <p className={style.placesCity1}>
                    Coorg . Mysuru . Ooty . Wa..
                  </p>
                </div>
                <div className={style.exploreNearYouCity1}>
                  <p className={style.exploreCity1}>Chennai</p>
                  <p className={style.placesCity1}>
                    Coorg . Mysuru . Ooty . Wa..
                  </p>
                </div>
              </div>
            </div>
            {/* Explore Near You end*/}

            {/* Travel Updates start */}

            <div className={style.travelUpdatesCity}>
              <div className={style.travelUpdates}>Travel Updates</div>
              <div className={style.travelUpdatesCityGroup}>
                <div className={style.travelUpdatesCityGroup1}>
                  <div className={style.travelUpdatesCity1}>
                  {/* <Image
                    src={image2}
                    alt="Image not found"
                    className={style.travelUpdatesImageCity1}
                  ></Image> */}
                  <p className={style.travelUpdatesCityText1}>Planning an Epic Summer <br/>Road Trip? 5 Must-Know Tips <br/>For Travel</p>
                  </div>
                </div>
                <div className={style.travelUpdatesCityGroup2}>
                  <div className={style.travelUpdatesCity2}>
                    {/* <Image
                      src={image7}
                      alt="Image not found"
                      className={style.travelUpdatesImageCity2}
                    ></Image> */}
                    <p className={style.travelUpdatesCityText2}>5 unexplored places in<br/> Manali you need to visit<br/> soon</p>
                  </div>
                  <div className={style.travelUpdatesCity3}>
                    {/* <Image
                      src={image8}
                      alt="Image not found"
                      className={style.travelUpdatesImageCity3}
                    ></Image> */}
                    <p className={style.travelUpdatesCityText3}>This heart-shaped lake <br/>in Kerala should be on<br/> your travel list</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Updates end */}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
