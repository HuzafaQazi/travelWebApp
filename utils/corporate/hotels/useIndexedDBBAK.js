import { useState, useEffect, useCallback } from "react";
import { openDB } from "idb";
import pako from "pako";

const DB_NAME = "HotelSearchDB";
const STORE_NAME = "hotelSearchResults";
const STORE_NAME_PREVIEW = "previewData";
const DB_VERSION = 1;

const useIndexedDBWithCompression = () => {
  const [db, setDb] = useState(null);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB(DB_NAME, DB_VERSION, {
          upgrade(db, oldVersion, newVersion, transaction) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
            // if (!db.objectStoreNames.contains(STORE_NAME_PREVIEW)) {
            //   db.createObjectStore(STORE_NAME_PREVIEW, { keyPath: "id" });
            // }
          },
        });
        setDb(database);
        setIsDbInitialized(true);
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };

    initDB();
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

  const saveSearchResults = useCallback(
    async (searchParams, results, dynamicFilters) => {
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
      } catch (error) {
        console.error("Error saving search results:", error);
      }
    },
    [db]
  );

  const getSearchResults = useCallback(async () => {
    if (!isDbInitialized) {
      console.error("Database not initialized");
      return null;
    }

    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      const result = await store.get("lastSearch");

      if (result) {
        return {
          params: decompressData(result.params),
          results: decompressData(result.compressedData),
          filters: decompressData(result.filters),
          timestamp: result.timestamp,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting search results:", error);
      return null;
    }
  }, [db, isDbInitialized]);

  const savePreviewData = useCallback(
    async (selectedHotel, selectedRooms, searchRequest, blockRoomResponse) => {
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
      } catch (error) {
        console.error("Error saving preview data:", error);
      }
    },
    [db]
  );

  // New function to get preview data
  const getPreviewData = useCallback(async () => {
    if (!isDbInitialized) {
      console.error("Database not initialized");
      return null;
    }

    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      const result = await store.get("previewData");

      if (result) {
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
      console.error("Error getting preview data:", error);
      return null;
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
