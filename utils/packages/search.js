import { useState, useEffect, useRef } from "react";
import axios, { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useLogin } from "@/store/context/LoginContext";
import config from "@/config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  redirectPackageDetail,
  redirectCountryPackagePage,
} from "../pageredirection";
import { useRouter } from "next/router";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase";

const useDestinationSearch = () => {
  const router = useRouter();

  const dropdownRef = useRef(null);

  const { openPopup } = useLogin();

  const [destination, setDestination] = useState("");
  const [matchingDestinations, setMatchingDestinations] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectionRoute, setRedirectionRoute] = useState(""); // this is required to avoid multiple search calls
  const [getAccessToken, setAccessToken] = useLocalStorage("accessToken");

  const [shouldSearch, setShouldSearch] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    if (shouldSearch && redirectionRoute) {
      search();
      setShouldSearch(false); // Reset the flag
    }
  }, [shouldSearch, redirectionRoute]);

  useEffect(() => {
    // Use a conditional check to avoid setting state on every render
    if (typeof sessionStorage !== "undefined") {
      // Safely access localStorage here
      setRedirectionRoute(getTabSpecificData("packages_redirect_route"));
    }
  }, []);

  useEffect(() => {
    // Listen to route changes and set loading to false when the route changes
    const handleRouteChange = () => {
      setLoading(false);
      // package detail page
      if (router.query.param) {
        let destination = getTabSpecificData("packages_destination");
        let redirectionRoute = getTabSpecificData("packages_redirect_route");

        if (!getTabSpecificData("packages_destination")) {
          destination = router.query.param[2];
          setTabSpecificData("packages_destination", destination);
        }

        if (!getTabSpecificData("packages_redirect_route")) {
          redirectionRoute = router.asPath;
          setTabSpecificData("packages_redirect_route", redirectionRoute);
        }
        setDestination(destination);
        setRedirectionRoute(redirectionRoute);
      } else if (router.pathname == "/") {
        // packages index page
        setDestination("");
      } else {
        let destination = getTabSpecificData("packages_destination");
        let redirectionRoute = getTabSpecificData("packages_redirect_route");

        if (!getTabSpecificData("packages_destination")) {
          destination =
            router.components["/packages/[country]"].props.pageProps.apiData[0]
              .country_name;
          setTabSpecificData("packages_destination", destination);
        }

        if (!getTabSpecificData("packages_redirect_route")) {
          redirectionRoute = router.asPath;
          setTabSpecificData("packages_redirect_route", redirectionRoute);
        }
        setDestination(destination);
        setRedirectionRoute(redirectionRoute);
      }
    };
    console.log(router);

    router.events.on("routeChangeComplete", handleRouteChange);

    // Cleanup the event listener
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  const searchDestinations = async (
    destination,
    setMatchingDestinations,
    setIsDropdownOpen,
    setIsSearchOpen,
    abortController
  ) => {
    try {
      const response = await axios.get(
        `${config.PACKAGES_SEARCH}?name=${destination.trim()}`,
        { signal: abortController.signal }
      );
      const data = response.data;
      setMatchingDestinations(data.data);
      setIsDropdownOpen(true);
      setIsSearchOpen(true);
      abortController.abort();
    } catch (error) {
      console.error("Error fetching matching destinations:", error);
      setMatchingDestinations([]);
    }
  };

  const abortControllerRef = useRef(new AbortController());

  const handleDestinationChange = (event) => {
    const value = event.target.value;
    setDestination(value);
    setRedirectionRoute("");

    // Abort previous request
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    if (value.trim().length >= 1) {
      searchDestinations(
        value,
        setMatchingDestinations,
        setIsDropdownOpen,
        setIsSearchOpen,
        abortControllerRef.current
      );
      setSelectedItemIndex(-1);
    }

    logEvent(analytics, "packages_search", {
      country: value,
    });
  };

  // const handleDestinationChange = (event) => {
  //   const value = event.target.value;
  //   setDestination(value);
  //   setRedirectionRoute("");
  //   logEvent(analytics, "packages_search", {
  //     country: value,
  //   });
  // };

  // useEffect(() => {
  //   let timer;

  //   clearTimeout(timer);

  //   timer = setTimeout(() => {
  //     if (destination && destination.length >= 1 && !redirectionRoute) {
  //       axios
  //         .get(`${config.PACKAGES_SEARCH}?name=${destination.trim()}`)
  //         .then((response) => {
  //           const data = response.data;
  //           setMatchingDestinations(data.data);
  //           setSelectedItemIndex(-1);
  //           setIsDropdownOpen(true);
  //           setIsSearchOpen(true);
  //         })
  //         .catch((error) => {
  //           console.error("Error fetching matching destinations:", error);
  //         });
  //     }
  //   }, 1000);

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // }, [destination, redirectionRoute]);

  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (
        e.key === "ArrowDown" &&
        selectedItemIndex < matchingDestinations.length - 1
      ) {
        setSelectedItemIndex(selectedItemIndex + 1);
      } else if (e.key === "ArrowUp" && selectedItemIndex > 0) {
        setSelectedItemIndex(selectedItemIndex - 1);
      } else if (e.key === "Enter" && selectedItemIndex >= 0) {
        await handleSelectDestination(matchingDestinations[selectedItemIndex]);
        setShouldSearch(true);
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [selectedItemIndex, matchingDestinations]);

  const handleSelectDestination = async (selectedDestination) => {
    let destinationText = "";
    let url = "";

    if (selectedDestination.type === 1) {
      destinationText = `${selectedDestination.package_name}, ${selectedDestination.city_name}, ${selectedDestination.country_name}`;
      url = redirectPackageDetail(
        selectedDestination.package_id,
        selectedDestination.package_name,
        selectedDestination.country_name
      );
    } else if (selectedDestination.type === 2) {
      destinationText = selectedDestination.country_name;
      url = redirectCountryPackagePage(selectedDestination.country_id);
    } else if (selectedDestination.type === 3) {
      destinationText = `${selectedDestination.city_name}, ${selectedDestination.country_name}`;
      url = redirectCountryPackagePage(selectedDestination.country_id);
    }

    setDestination(destinationText);
    setRedirectionRoute(url);
    setMatchingDestinations([]);
    setIsDropdownOpen(false); // Added this line to close the dropdown
  };

  const search = async () => {
    if (!destination) {
      if (!isToastVisible) {
        toast("Please search and select destination or packages");
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
      return;
    }
    try {
      setLoading(true);
      setTabSpecificData("packages_destination", destination);
      setTabSpecificData("packages_redirect_route", redirectionRoute);
      router.push(redirectionRoute);

      logEvent(analytics, "packages_search_click", {
        country: destination,
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error?.errormessage ||
        "Unable to fetch packages, please try after some time";
      if (!isToastVisible) {
        toast(errorMessage);
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
      setLoading(false);
    }
  };

  return {
    destination,
    matchingDestinations,
    selectedItemIndex,
    isDropdownOpen,
    loading,
    redirectionRoute,
    handleDestinationChange,
    handleSelectDestination,
    search,
    setIsDropdownOpen,
    setDestination,
    openPopup,
    dropdownRef,
    setRedirectionRoute,
    setMatchingDestinations,
    isSearchOpen,
  };
};

export default useDestinationSearch;
