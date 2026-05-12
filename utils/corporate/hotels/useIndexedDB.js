import { useState, useEffect, useCallback } from "react";
import { openDB } from "idb";
import pako from "pako";
import {
  getTabId,
  setTabSpecificData,
  getTabSpecificData,
} from "@/utils/axios/axios";

const DB_NAME = "HotelSearchDB";
const STORE_NAME = "hotelSearchResults";
const STORE_NAME_PREVIEW = "previewData";
const DB_VERSION = 1;

// Configuration - change this to toggle between IndexedDB and sessionStorage
const STORAGE_CONFIG = {
  useIndexedDB: false, // Set to false to use sessionStorage instead
};

const useIndexedDBWithCompression = () => {
  const [db, setDb] = useState(null);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const initStorage = async () => {
      try {
        if (STORAGE_CONFIG.useIndexedDB) {
          // Initialize IndexedDB
          const database = await openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
              if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
              }
            },
          });
          setDb(database);
        }
        // For sessionStorage, no initialization needed
        setIsDbInitialized(true);
      } catch (error) {
        console.error("Error initializing storage:", error);
        // Fallback to sessionStorage if IndexedDB fails
        if (STORAGE_CONFIG.useIndexedDB) {
          console.log("Falling back to sessionStorage");
          STORAGE_CONFIG.useIndexedDB = false;
          setIsDbInitialized(true);
        }
      }
    };

    initStorage();
  }, []);

  const compressData = (data) => {
    const stringData = JSON.stringify(data);
    const compressedData = pako.deflate(stringData);
    return compressedData;
  };

  const decompressData = (compressedData) => {
    const decompressedData = pako.inflate(compressedData, { to: "string" });
    return JSON.parse(decompressedData);
  };

  // Helper functions for sessionStorage
  const saveToSessionStorage = (key, data) => {
    try {
      const compressedData = compressData(data);
      const compressedString = Array.from(compressedData).join(",");
      // Use localStorage instead of sessionStorage — shared across tabs
      localStorage.setItem(`hotelSearch_${key}`, compressedString);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const getFromSessionStorage = (key) => {
    try {
      const compressedString = localStorage.getItem(`hotelSearch_${key}`);
      if (!compressedString) return null;
      const compressedData = new Uint8Array(
        compressedString.split(",").map(Number),
      );
      return decompressData(compressedData);
    } catch (error) {
      console.error("Error getting from localStorage:", error);
      return null;
    }
  };

  const saveSearchResults = useCallback(
    async (searchParams, results, dynamicFilters) => {
      if (STORAGE_CONFIG.useIndexedDB) {
        // IndexedDB implementation
        if (!db) {
          console.error("Database not initialized");
          return;
        }

        try {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);

          const compressedResults = compressData(results);
          const compressedRequest = compressData(searchParams);
          const compressedFilters = compressData(dynamicFilters);

          await store.put({
            id: "lastSearch",
            params: compressedRequest,
            compressedData: compressedResults,
            filters: compressedFilters,
            timestamp: Date.now(),
          });

          await tx.done;
          console.log("💾 Saved search results to IndexedDB");
        } catch (error) {
          console.error("Error saving search results to IndexedDB:", error);
        }
      } else {
        // SessionStorage implementation
        try {
          const searchData = {
            params: searchParams,
            results: results,
            filters: dynamicFilters,
            timestamp: Date.now(),
          };
          saveToSessionStorage("lastSearch", searchData);
        } catch (error) {
          console.error(
            "Error saving search results to sessionStorage:",
            error,
          );
        }
      }
    },
    [db],
  );

  const getSearchResults = useCallback(async () => {
    if (!isDbInitialized) {
      console.error("Storage not initialized");
      return null;
    }

    if (STORAGE_CONFIG.useIndexedDB) {
      // IndexedDB implementation
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const result = await store.get("lastSearch");

        if (result) {
          console.log("📖 Retrieved search results from IndexedDB");
          return {
            params: decompressData(result.params),
            results: decompressData(result.compressedData),
            filters: decompressData(result.filters),
            timestamp: result.timestamp,
          };
        }

        return null;
      } catch (error) {
        console.error("Error getting search results from IndexedDB:", error);
        return null;
      }
    } else {
      // SessionStorage implementation
      try {
        const result = getFromSessionStorage("lastSearch");
        return result;
      } catch (error) {
        console.error(
          "Error getting search results from sessionStorage:",
          error,
        );
        return null;
      }
    }
  }, [db, isDbInitialized]);

  const savePreviewData = useCallback(
    async (selectedHotel, selectedRooms, searchRequest, blockRoomResponse) => {
      if (STORAGE_CONFIG.useIndexedDB) {
        // IndexedDB implementation
        if (!db) {
          console.error("Database not initialized");
          return;
        }

        try {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);

          const compressedHotel = compressData(selectedHotel);
          const compressedRooms = compressData(selectedRooms);
          const compressedRequest = compressData(searchRequest);
          const compressedBlockRoomResponse = compressData(blockRoomResponse);

          await store.put({
            id: "previewData",
            hotel: compressedHotel,
            rooms: compressedRooms,
            searchRequest: compressedRequest,
            blockRoom: compressedBlockRoomResponse,
            timestamp: Date.now(),
          });

          await tx.done;
          console.log("💾 Saved preview data to IndexedDB");
        } catch (error) {
          console.error("Error saving preview data to IndexedDB:", error);
        }
      } else {
        // SessionStorage implementation
        try {
          const previewData = {
            hotel: selectedHotel,
            rooms: selectedRooms,
            searchRequest: searchRequest,
            blockRoom: blockRoomResponse,
            timestamp: Date.now(),
          };
          saveToSessionStorage("previewData", previewData);
        } catch (error) {
          console.error("Error saving preview data to sessionStorage:", error);
        }
      }
    },
    [db],
  );

  const getPreviewData = useCallback(async () => {
    if (!isDbInitialized) {
      console.error("Storage not initialized");
      return null;
    }

    if (STORAGE_CONFIG.useIndexedDB) {
      // IndexedDB implementation
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        const result = await store.get("previewData");

        if (result) {
          console.log("📖 Retrieved preview data from IndexedDB");
          return {
            hotel: decompressData(result.hotel),
            rooms: decompressData(result.rooms),
            searchRequest: decompressData(result.searchRequest),
            blockRoom: decompressData(result.blockRoom),
            timestamp: result.timestamp,
          };
        }

        return null;
      } catch (error) {
        console.error("Error getting preview data from IndexedDB:", error);
        return null;
      }
    } else {
      // SessionStorage implementation
      try {
        const result = getFromSessionStorage("previewData");
        return result;
      } catch (error) {
        console.error("Error getting preview data from sessionStorage:", error);
        return null;
      }
    }
  }, [db, isDbInitialized]);

  return {
    saveSearchResults,
    getSearchResults,
    savePreviewData,
    getPreviewData,
    isDbInitialized,
  };
};

export default useIndexedDBWithCompression;
