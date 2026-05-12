import axios from "@/utils/axios/axios";
import config from "@/config";

const deleteUserAccount = async (userId) => {
  if (!userId) {
    throw new Error("User ID not found in local storage");
  }

  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    const response = await axios.put(
      `${config.DELETE_USER}`,
      {
        userId: userId,
      },
      configuration
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};

export default deleteUserAccount;
