export const detectDevTools = () => {
  // Function to detect whether DevTools is open or not
  const devToolsListener = () => {
    // Check if DevTools is open by comparing the width and height of the window to a predefined threshold
    if (
      window.outerWidth - window.innerWidth > 100 ||
      window.outerHeight - window.innerHeight > 100
    ) {
      // DevTools is open
      alert(
        "Developer Tools detected! Please refrain from inspecting the code."
      );
      //   window.location.href = "/";
    }
  };

  // Set interval to continuously check for DevTools
  setInterval(() => {
    devToolsListener();
  }, 1000);

  // Initial check for DevTools
  devToolsListener();
};
