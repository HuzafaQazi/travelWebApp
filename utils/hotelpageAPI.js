import axios from '@/utils/axios/axios';;
import config from "@/config";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getTabSpecificData, setTabSpecificData, removeTabSpecificData } from "@/utils/axios/axios";

export async function getHotelRooms(qTraceId, hotelCode,vendorCode) {
  try {
    console.log("Get hotel rooms called");
    const [getuserip, setuserip] = useLocalStorage("userip");
    const storedUserIp = getTabSpecificData("userip");
    const req = {
        "qTraceId": qTraceId,
        "ipaddress": storedUserIp=="undefined"?null:storedUserIp,
        "hotelCode": hotelCode,
        "vendorcode": vendorCode
    };
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(`${config.GET_HOTEL_ROOMS}`,req, configuration);

    console.log("room data: ",JSON.stringify(response));
    
    return response.data;
  } catch (error) {
    console.error("An error occurred while calling getHotelRooms", error);
    return error.response;
  }
}

export async function getHotelInfo(qTraceId, hotelCode,vendorCode) {
  try {
    console.log("Get hotel info called");
    const [getuserip, setuserip] = useLocalStorage("userip");
    const storedUserIp = getTabSpecificData("userip");
    const req = {
        "qTraceId": qTraceId,
        "ipaddress": storedUserIp=="undefined"?null:storedUserIp,
        "hotelCode": hotelCode,
        "vendorcode": vendorCode
    };
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(`${config.GET_HOTEL_INFO}`,req, configuration);

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling getHotelInfo", error);
    return error;
  }
}

