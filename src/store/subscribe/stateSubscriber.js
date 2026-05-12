// stateSubscriber.js
import { store } from "@/store/store";

// Create a subscriber that can track specific parts of the state
export const createStateSubscriber = (selector) => {
  let currentState = selector(store.getState());
  let listeners = new Set();

  // Get current state value
  const getState = () => currentState;

  // Subscribe to state changes
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // Subscribe to Redux store
  store.subscribe(() => {
    const nextState = selector(store.getState());
    if (nextState !== currentState) {
      currentState = nextState;
      listeners.forEach((listener) => listener(currentState));
    }
  });

  return {
    getState,
    subscribe,
  };
};

// Create specific state subscribers
export const userStateSubscriber = createStateSubscriber(
  (state) => state.user.userInfo
);
export const companyStateSubscriber = createStateSubscriber(
  (state) => state.company
);
export const settingsStateSubscriber = createStateSubscriber(
  (state) => state.settings
);

// Example usage in your functions
export const switchToQugo = async () => {
  try {
    const userState = userStateSubscriber.getState();
    const userDetails = getQugoLoggedInUserDetails();

    // Subscribe to user state changes if needed
    const unsubscribe = userStateSubscriber.subscribe((newUserState) => {
      console.log("User state updated:", newUserState);
      // Handle state changes
    });

    const localStorageItems = [
      { key: "accessToken", value: userDetails?.loggedInDetails?.accessToken },
      { key: "phoneNumber", value: userDetails?.loggedInDetails?.mobile },
      { key: "userID", value: userDetails?.loggedInDetails?._id },
      { key: "userId", value: userDetails?.loggedInDetails?._id },
      { key: "userDetails", value: userDetails?.loggedInDetails?.firstName },
    ];

    localStorageItems.forEach(({ key, value }) => {
      if (value) {
        localStorage.setItem(key, `"${value}"`);
      } else {
        localStorage.removeItem(key);
      }
    });

    localStorage.setItem("loggedInUserType", "qugo");
    await Router.push("/");
    window.dispatchEvent(new CustomEvent("userTypeChanged"));

    // Clean up subscription when done if needed
    unsubscribe();
  } catch (error) {
    console.error("Error switching to Qugo:", error);
  }
};

export const updateCorporateUserLocalStorage = (updatedUserData) => {
  try {
    const userState = userStateSubscriber.getState();
    const companyState = companyStateSubscriber.getState();

    // Get the compressed data from localStorage
    const compressedData = localStorage.getItem("corporateUserDetails");
    if (!compressedData) {
      console.error("No corporate user details found in local storage.");
      return;
    }

    // Decompress and parse the data
    const numbersArray = compressedData.split(",").map(Number);
    const compressedUint8Array = new Uint8Array(numbersArray);
    const decodedData = pako.inflate(compressedUint8Array, { to: "string" });
    const existingDetails = JSON.parse(decodedData);

    // Update with current state data
    const updatedDetails = {
      ...existingDetails,
      userDetails: {
        ...existingDetails.userDetails,
        ...updatedUserData,
        ...userState, // Merge with current Redux state
      },
      companyDetails: {
        ...existingDetails.companyDetails,
        ...companyState, // Merge with current Redux state
      },
    };

    // Compress and store updated data
    const updatedCompressedData = pako.deflate(JSON.stringify(updatedDetails));
    localStorage.setItem("corporateUserDetails", updatedCompressedData);

    // Update Redux store
    const updatedData = {
      userId: updatedDetails.userDetails._id,
      companyId: updatedDetails.companyDetails._id,
      loggedInDetails: updatedDetails,
    };
    store.dispatch(loginUser(updatedData));
  } catch (error) {
    console.error("Failed to update corporate user details:", error);
  }
};

// Example of using multiple subscribers
export const syncUserSettings = () => {
  const userState = userStateSubscriber.getState();
  const settingsState = settingsStateSubscriber.getState();

  // Subscribe to both user and settings changes
  const unsubscribeUser = userStateSubscriber.subscribe((newUserState) => {
    // Handle user state changes
    console.log("User state changed:", newUserState);
  });

  const unsubscribeSettings = settingsStateSubscriber.subscribe(
    (newSettings) => {
      // Handle settings changes
      console.log("Settings changed:", newSettings);
    }
  );

  // Return cleanup function
  return () => {
    unsubscribeUser();
    unsubscribeSettings();
  };
};


// Another example

// import { store } from "@/store/store";

// // Basic subscriber
// store.subscribe(() => {
//   // This runs every time the state changes
//   console.log('State changed:', store.getState());
// });

// Create a subscriber for specific state piece
// const createStateSubscriber = (selector) => {
//     // Keep track of current state
//     let currentState = selector(store.getState());
    
//     // Store listeners
//     let listeners = new Set();
    
//     // Subscribe to Redux store
//     store.subscribe(() => {
//       // Get new state
//       const nextState = selector(store.getState());
      
//       // Only notify if state actually changed
//       if (nextState !== currentState) {
//         currentState = nextState;
//         // Notify all listeners
//         listeners.forEach(listener => listener(currentState));
//       }
//     });
    
//     return {
//       // Get current state
//       getState: () => currentState,
//       // Add listener
//       subscribe: (listener) => {
//         listeners.add(listener);
//         // Return unsubscribe function
//         return () => listeners.delete(listener);
//       }
//     };
//   };

// Create subscribers for different parts of state
// const userSubscriber = createStateSubscriber(state => state.user.userInfo);
// const settingsSubscriber = createStateSubscriber(state => state.settings);

// // Example usage in a function
// const handleUserChanges = () => {
//   // Get current state
//   const currentUser = userSubscriber.getState();
  
//   // Subscribe to changes
//   const unsubscribe = userSubscriber.subscribe((newUserState) => {
//     console.log('User state changed:', newUserState);
//     // Do something with the new state
//   });
  
//   // Don't forget to unsubscribe when done!
//   return unsubscribe;
// };

// Create subscriber for user state
// const userSubscriber = createStateSubscriber(state => state.user.userInfo);

// export const switchToQugo = async () => {
//   try {
//     // Get initial state
//     const userState = userSubscriber.getState();
    
//     // Listen for changes
//     const unsubscribe = userSubscriber.subscribe((newUserState) => {
//       // Update local storage when user state changes
//       if (newUserState) {
//         localStorage.setItem("userDetails", JSON.stringify(newUserState));
//       }
//     });

//     const userDetails = getQugoLoggedInUserDetails();
//     const localStorageItems = [
//       { key: "accessToken", value: userDetails?.loggedInDetails?.accessToken },
//       { key: "phoneNumber", value: userDetails?.loggedInDetails?.mobile },
//       { key: "userID", value: userDetails?.loggedInDetails?._id },
//       { key: "userId", value: userDetails?.loggedInDetails?._id },
//       { key: "userDetails", value: userDetails?.loggedInDetails?.firstName },
//     ];

//     localStorageItems.forEach(({ key, value }) => {
//       if (value) localStorage.setItem(key, `"${value}"`);
//       else localStorage.removeItem(key);
//     });

//     localStorage.setItem("loggedInUserType", "qugo");
//     await Router.push("/");
    
//     // Clean up subscription
//     unsubscribe();
//   } catch (error) {
//     console.error("Error switching to Qugo:", error);
//   }
// };


// Multiple subscribers for different purposes
// const userSubscriber = createStateSubscriber(state => state.user.userInfo);
// const settingsSubscriber = createStateSubscriber(state => state.settings);

// // Function that uses multiple subscribers
// const syncUserAndSettings = () => {
//   // Get initial states
//   const currentUser = userSubscriber.getState();
//   const currentSettings = settingsSubscriber.getState();
  
//   // Subscribe to both
//   const unsubscribeUser = userSubscriber.subscribe((newUser) => {
//     console.log('User updated:', newUser);
//   });
  
//   const unsubscribeSettings = settingsSubscriber.subscribe((newSettings) => {
//     console.log('Settings updated:', newSettings);
//   });
  
//   // Return cleanup function
//   return () => {
//     unsubscribeUser();
//     unsubscribeSettings();
//   };
// };