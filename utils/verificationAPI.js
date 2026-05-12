import axios from '@/utils/axios/axios';;
import config from "@/config";
export async function panVerification(name,pan){
    try {
      if(pan){
        const configuration = {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        };
        const data = {
            name: name,
            pan: pan
        }
        const response = await axios
      .post(config.PAN_VALIDATION, data, configuration)
      .then();
    console.log(`Pan Verification ${JSON.stringify(response.data)}`);
    if (response.status === 200 && response.data.status === "SUCCESS") {
      return response.data;
    } else {
      console.log(
        "Got an error in pan verification, stauts code is ",
        response.status,
        "Status is",
        response.data.status
      );
    }
  }else{
    return;
  }
      } catch (error) {
        console.error("An error occurred while calling pan verification", error);
        return;
      }
}