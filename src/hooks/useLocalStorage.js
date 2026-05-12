
function useLocalStorage(key) {
  const getValueBAK = () => {
    try {
      const value = localStorage.getItem(key);
      // const updatedValue =
      //   value && value !== "undefined" && value !== undefined
      //     ? JSON.stringify(value)
      //     : null;
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Error retrieving data from local storage:", error);
      return null;
    }
  };

  const getValue = () => {
    try {
      const value = localStorage.getItem(key);

      if (!value || value === "undefined" || value === undefined) return null;

      return value.startsWith('"') || value.startsWith("'")
        ? JSON.parse(value)
        : value;
    } catch (error) {
      console.error("Error retrieving data from local storage:", error);
      return null;
    }
  };

  const setValue = (value) => {
    try {
      // const updatedValue =
      //   value && value !== "undefined" && value !== undefined
      //     ? JSON.stringify(value)
      //     : null;
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving data to local storage:", error);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing data from local storage:", error);
    }
  };

  return [getValue, setValue, removeValue];
}

export default useLocalStorage;
