import axios,{getTabSpecificData} from '@/utils/axios/axios';;
import config from "@/config";

export const fetchGetQuote = async (qTraceId, resultIndex) => {
  try {
    const userip = getTabSpecificData("userip");
    const payload = {
      qTraceId: qTraceId,
      userType: "b2b",
      fareQuoteReqData: {
        endUserIp: userip=="undefined"?null:userip,
        resultIndex,
      },
    };
    const { data } = await axios.post(
      `${config.FLIGHTS_SEARCH_FAREQUOTE}`,
      payload
    );

    const response = data?.data;

    // Check if all statuses are "SUCCESS"
    const allSuccess = response.every(
      (response) => response.status === "SUCCESS"
    );
    if (!allSuccess) {
      throw {
        response: {
          data: {
            error: {
              errorMessage: [
                {
                  data: "Fare Quote failed from the Supplier end. Please try again.",
                },
              ],
            },
          },
        },
      };
    }
    return response[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};
