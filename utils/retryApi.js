// A reusable function that retries API calls based on conditions
const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let attempts = 0;
  let lastError;

  while (attempts < maxRetries) {
    try {
      const response = await apiCall();
      return response; // If API call is successful, return the response
    } catch (error) {
      // Check if it's an Axios error (network error, timeout, etc.)
      const isNetworkError = !error.response;
      const isServerError = error.response && error.response.status === 500;

      // Only retry on network errors or server errors (HTTP 500)
      if (isNetworkError || isServerError) {
        lastError = error;
        attempts++;

        if (attempts < maxRetries) {
          console.warn(`Retrying API call... Attempt ${attempts}`);
          await new Promise((resolve) => setTimeout(resolve, delay)); // Delay between retries
        }
      } else {
        // For other status codes (e.g., 400, 404), do not retry and throw the error immediately
        throw error;
      }
    }
  }

  throw lastError; // If all retries fail, throw the last encountered error
};

export { retryApiCall };
