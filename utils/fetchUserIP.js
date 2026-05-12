import { setTabSpecificData, getTabSpecificData } from "@/utils/axios/axios";

export const fetchUserIp = async () => {
  try {
    const parseStoredValue = (value) => {
      try {
        const parsed = JSON.parse(value);
        return parsed !== undefined &&
          parsed !== "undefined" &&
          parsed !== "'undefined'"
          ? parsed
          : null;
      } catch {
        return null; // Return null if JSON.parse fails
      }
    };

    // Retrieve and parse stored IP and location data
    const storedIp = getTabSpecificData("userip");
    const storedLocation = parseStoredValue(getTabSpecificData("userLocation"));

    console.log(storedIp);
    console.log(storedLocation);
    if (storedIp && storedLocation) {
      console.log(
        "Using cached IP and location data:",
        storedIp,
        storedLocation
      );
      return storedIp;
    }

    // Fetch IP if it's not in localStorage
    const response = await fetch("https://api.ipify.org/?format=json");
    const ipData = await response.json();
    const userIp = ipData.ip;

    if (userIp && userIp !== "undefined") {
      localStorage.setItem("userip", userIp);
      setTabSpecificData("userip", userIp);

      // Fetch the location using the user's IP address
      const locationResponse = await fetch(`https://ipapi.co/${userIp}/json/`);
      const locationData = await locationResponse.json();

      // Store IP and location data in local storage
      localStorage.setItem("userLocation", JSON.stringify(locationData));
      setTabSpecificData("userLocation", JSON.stringify(locationData));

      console.log("User location data stored in local storage:", locationData);
      return userIp;
    }

    return ""; // Return empty string if no valid IP is found
  } catch (error) {
    console.error("Error fetching user IP:", error);
  }
};
