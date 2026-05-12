import axios from "@/utils/axios/axios";
import config from "@/config";

export async function getUserStatus(userId) {
  try {
    console.log(config);
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": " *",
      },
    };

    const response = await axios.get(
      `${config.GET_USER_STATUS}?userId=${userId}`,
      configuration
    );
    console.log("reposnse", response);
    return response.data;
  } catch (error) {
    console.error("An error occurred while sending change request", error);
    return error;
    // throw error;
  }
}
