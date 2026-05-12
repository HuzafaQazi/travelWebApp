import axios, { getTabSpecificData } from '@/utils/axios/axios';;
import config from "@/config";
import useLocalStorage from "@/hooks/useLocalStorage";

export async function getHotelSearchData(
  cityId,
  countryCode,
  hotelCode,
  checkinDate,
  checkoutDate,
  numberOfRooms,
  roomCount
) {
  try {
    console.log("Hotel search called");
    const checkInDate = new Date(checkinDate);
    const checkOutDate = new Date(checkoutDate);
    const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
    const noOfNight = Math.round(Math.abs((checkOutDate - checkInDate) / oneDay)).toString();
    const formattedDate = checkInDate.toLocaleDateString('en-GB');
    console.log("Room count is", roomCount);
    console.log("hotelcode =>",hotelCode);
    const [getuserip, setuserip] = useLocalStorage("userip");
    const storedUserIp = getTabSpecificData("userip");
    const req = {
      checkInDate: formattedDate,
      noOfNights: noOfNight,
      countryCode: countryCode,
      cityId: cityId,
      hotelCode: hotelCode,
      preferredCurrency: "INR",
      guestNationality: "IN",
      noOfRooms: numberOfRooms,
      maxRating: 5,
      minRating: 1,
      isNearBySearchAllowed: false,
      ipaddress: storedUserIp=="undefined"?null:storedUserIp,
      isislandhopper: "false",
      radius: "",
      latitude: "",
      longitude: "",
      roomGuests: roomCount.map((roomCount) => ({
        noOfAdults: roomCount.adults,
        noOfChild: roomCount.children,
        childAge: roomCount.childAge,
      })),
    };
    console.log("The search req is ", JSON.stringify(req));
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.GET_HOTEL_SEARCH_DATA}`,
    //   {
    //     "checkInDate": "11/08/2023",
    //     "noOfNights": "2",
    //     "countryCode": "IN",
    //     "cityId": "111124",
    //     "hotelCode": "",
    //     "preferredCurrency": "INR",
    //     "guestNationality": "IN",
    //     "noOfRooms": 2,
    //     "maxRating": 5,
    //     "minRating": 1,
    //     "isNearBySearchAllowed": false,
    //     "ipaddress": "127.6.5.3",
    //     "isislandhopper": "false",
    //     "radius" : "",
    //     "latitude" : "",
    //     "longitude": "",
    //     "roomGuests": [
    //         {
    //             "noOfAdults": 2,
    //             "noOfChild": 0,
    //             "childAge": []
    //         },
    //         {
    //             "noOfAdults": 2,
    //             "noOfChild": 0,
    //             "childAge": []
    //         }
    //     ]
    // },
      req,
      configuration
    );

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling gethotelsearchdata", error);
    return error;
  }
}
