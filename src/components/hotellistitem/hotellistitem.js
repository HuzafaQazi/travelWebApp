import config from "@/config";
import useLocalStorage from "@/hooks/useLocalStorage";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "@/utils/axios/axios";
import { getTabSpecificData } from "@/utils/axios/axios";
import "bootstrap/dist/css/bootstrap.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Collapse } from "react-bootstrap";
import { toast } from "react-toastify";
import "reactjs-popup/dist/index.css";
import { getHotelRooms } from "../../../utils/hotelpageAPI";
import RoomListItem from "../roomlistitem/roomlistitem";
import StarRating from "../starRating";
import fallbackImage from "../../images/Group 14468.png";
import ViewMoreDialog from "../viewmoredialog/viewmoredialog";
import style from "./styles.module.css";
import { analytics } from "../../../utils/firebase";
import { logEvent } from "firebase/analytics";
import { formatPrice } from "@/utils/common";

const HotelListItem = (props) => {
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMoreLoading, setviewMoreLoading] = useState(false);
  const [hotelInfo, setHotelInfo] = useState({});
  const [roomCombinationsArray, setroomCombinationsArray] = useState([]);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState([]);
  const [allowedRoomIndexes, setAllowedRoomIndexes] = useState([]);
  const [isReserveAllowed, setIsReserveAllowed] = useState();
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [disableClick, setDisableClick] = useState(false);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [src, setSrc] = useState(props.hotel.hotelStaticImageUrl || "");

  useEffect(() => {
    setOpen(false);
  }, [props.hotel]);

  const handleError = () => {
    setSrc(fallbackImage); // Set the source to the fallback image on error
  };

  const selectRoomOnClick = async () => {
    if (open) {
      setOpen(!open);
      return;
    } else if (disableClick) {
      return;
    }

    try {
      setLoading(true);
      let resp = await getHotelRooms(
        props.qTraceId,
        props.hotel.hotelCode,
        props.hotel.vendorCode
      );
      try {
        if (resp && resp.data && resp.data.status === "FAILED") {
          toast(resp.data.message); // Display error message in toast
        }
        if (resp !== null && resp.data.HotelRoomsResults) {
          setroomCombinationsArray(resp.data.roomCombinationsArray);
          let updatedRooms = resp.data.HotelRoomsResults.map((item) => {
            new Date(item.lastVoucherDate) > new Date()
              ? setIsReserveAllowed(true)
              : setIsReserveAllowed(false);
            return {
              availabilityType: item.availabilityType,
              supplierCategoryId: item.supplierCategoryId,
              childCount: item.childCount,
              requireAllPaxDetails: item.requireAllPaxDetails,
              roomDescription: item.roomDescription,
              roomTypeName: item.roomTypeName,
              roomTypeCode: item.roomTypeCode,
              roomIndex: item.roomIndex,
              ratePlanCode: item.ratePlanCode,
              smokingPreference: item.smokingPreference,
              ratePlanName: item.ratePlanName,
              infoSource: item.infoSource,
              sequenceNo: item.sequenceNo,
              isPerStay: item.isPerStay,
              roomPromotion: item.roomPromotion,
              amenities: item.amenities,
              amenity: item.amenity,
              lastCancellationDate: item.lastCancellationDate,
              cancellationPolicies: item.cancellationPolicies,
              lastVoucherDate: item.lastVoucherDate,
              cancellationPolicy: item.cancellationPolicy,
              inclusion: item.inclusion,
              isPassportMandatory: item.isPassportMandatory,
              isPANMandatory: item.isPANMandatory,
              dayRates: item.dayRates,
              price: item.price,
            };
          });
          setRooms(updatedRooms);
          setOpen(!open);
          setViewOpen(false);

          logEvent(analytics, "select_room_click", {
            hotelCode: props.hotel.hotelCode,
          });
        } else {
          if (!isToastVisible) {
            toast("No results Found");
            setIsToastVisible(true);

            // Reset the flag after a specific duration (e.g., 3 seconds)
            setTimeout(() => {
              setIsToastVisible(false);
            }, 6000);
          }
        }
      } catch (error) {
        console.log("Error, could not populate hotel rooms", error);
        toast("Error, could not fetch hotel rooms ", error);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in selectRoomOnClick", error);
    } finally {
      setTimeout(() => {
        setDisableClick(false);
      }, 6000); // 6 seconds in milliseconds
    }
  };

  const closeViewMore = () => {
    setViewOpen(false);
  };

  useEffect(() => {
    // Close the view more dialog when the component unmounts
    return () => {
      closeViewMore();
    };
  }, []);

  const viewMoreOnClick = async (hotelCode) => {
    if (disableClick) {
      return;
    }

    if (hotelCode === props.openHotelCode) {
      props.setOpenHotelCode(null);
      setViewOpen(false);
      return;
    }

    try {
      setviewMoreLoading(true);
      const storedUserIp = getTabSpecificData("userip");

      const configuration = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      };

      const payload = {
        qTraceId: props.qTraceId,
        ipaddress: storedUserIp == "undefined" ? null : storedUserIp,
        hotelCode,
        vendorcode: props.hotel.vendorCode,
      };

      const { data } = await axios.post(
        `${config.GET_HOTEL_INFO}`,
        payload,
        configuration
      );

      const response = data.data;

      if (data.status) {
        setHotelInfo(response.hotelInfo);
        props.setOpenHotelCode(hotelCode);
        setOpen(false);
        setViewOpen(true);

        logEvent(analytics, "view_more_click", {
          hotelCode: hotelCode,
        });
      } else {
        toast("Could not load hotel data");
      }
    } catch (error) {
      if (!isToastVisible) {
        toast(
          error?.response?.data?.error?.errormessage ||
            "Unable to view hotel, please try after some time"
        );
        setIsToastVisible(true);

        // Reset the flag after a specific duration (e.g., 3 seconds)
        setTimeout(() => {
          setIsToastVisible(false);
        }, 6000);
      }
    } finally {
      setviewMoreLoading(false);

      setTimeout(() => {
        setDisableClick(false);
      }, 6000);
    }
  };

  useEffect(() => {
    const initialAllowedRoomIndexes = rooms.map((room) => room.roomIndex);
    setAllowedRoomIndexes(initialAllowedRoomIndexes);
  }, [rooms]);

  useEffect(() => {
    if (selectedRoomIndex.length !== props.requestedRooms.length) {
      // Filter out room indexes that are not present in props.requestedRooms
      setSelectedRoomIndex((prevSelectedIndexes) =>
        prevSelectedIndexes.filter((index) =>
          props.requestedRooms?.some(
            (room) =>
              room.roomIndex === index || room.supplierCategoryId === index
          )
        )
      );
    }
  }, [props.requestedRooms]);

  // on remove selected rooms for open combination
  useEffect(() => {
    if (roomCombinationsArray.length > 0) {
      const selectedIndexes = selectedRoomIndex;
      const selectedCombination = roomCombinationsArray.find(
        (combination) =>
          combination.roomCombination.some((roomComb) =>
            roomComb.roomIndex.some((index) => selectedIndexes.includes(index))
          ) && selectedIndexes.includes(combination.categoryId)
      );

      if (
        selectedCombination &&
        selectedCombination.infoSource === "OpenCombination"
      ) {
        // Filter the roomCombination based on selected roomIndex and excluded roomIndexes
        const filteredRoomCombination =
          selectedCombination.roomCombination.filter((roomComb) =>
            roomComb.roomIndex.every(
              (index) => !selectedRoomIndex.includes(index)
            )
          );
        // Update selectedCombinationCopy with the filtered roomCombination
        const selectedCombinationCopy = {
          ...selectedCombination,
          roomCombination: filteredRoomCombination,
        };

        if (filteredRoomCombination.length > 0) {
          const allowedRoomIndexes = filteredRoomCombination
            .map((roomComb) => roomComb.roomIndex)
            .flat();

          // Filter out only integers
          const filteredRoomIndex = selectedRoomIndex.filter(
            (index) => Number.isInteger(index) && !isNaN(index)
          );
          if (
            filteredRoomIndex.length >=
            selectedCombination.roomCombination.length
          ) {
            setAllowedRoomIndexes([]);
          } else {
            setAllowedRoomIndexes([
              ...allowedRoomIndexes,
              selectedCombination.categoryId,
            ]);
          }
        } else {
          setAllowedRoomIndexes([]);
        }
      }
    }
  }, [selectedRoomIndex, roomCombinationsArray]);

  const restoreSelectedRooms = (stateData) => {
    if (stateData && stateData.selectedRoomIndex) {
      setSelectedRoomIndex(stateData.selectedRoomIndex);
    }
  };

  const handlePopstate = (event) => {
    const stateData = event.state;
    restoreSelectedRooms(stateData);
  };

  useEffect(() => {
    window.addEventListener("popstate", handlePopstate);
    restoreSelectedRooms(window.history.state);

    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

  const isRoomSelectable = (roomIndex, supplierCategoryId) => {
    if (
      props.hotel.hotelCode !== props.selectedHotelCode &&
      props.selectedHotelCode !== undefined
    )
      return true;
    if (props.requestedRooms?.length === 0) return true;
    if (
      selectedRoomIndex.includes(roomIndex) &&
      selectedRoomIndex.includes(supplierCategoryId)
    )
      return false;
    return (
      allowedRoomIndexes.includes(roomIndex) &&
      allowedRoomIndexes.includes(supplierCategoryId)
    );
  };

  const isRoomSelected = (roomIndex, supplierCategoryId) => {
    if (
      props.hotel.hotelCode !== props.selectedHotelCode &&
      props.selectedHotelCode !== undefined
    )
      return false;
    // if (props.requestedRooms?.length === 0) return true;
    if (
      selectedRoomIndex.includes(roomIndex) &&
      selectedRoomIndex.includes(supplierCategoryId)
    )
      return true;

    return false;
  };

  const handleRoomSelect = (roomIndex, supplierCategoryId) => {
    if (
      props.hotel.hotelCode !== props.selectedHotelCode &&
      props.selectedHotelCode !== undefined
    ) {
      return;
    }

    // Check if the selected room index is the same as the currently selected room
    const isRoomAlreadySelected =
      selectedRoomIndex.includes(roomIndex) &&
      selectedRoomIndex.includes(supplierCategoryId);

    // Copy the current list of excluded roomIndexes
    const excludedRoomIndexes = [...selectedRoomIndex];

    if (isRoomAlreadySelected) {
      // If the room is already selected, unselect it and remove from selectedRoomIndexes
      setSelectedRoomIndex((prevSelectedIndexes) =>
        prevSelectedIndexes.filter(
          (index) => index !== roomIndex && index !== supplierCategoryId
        )
      );

      // Remove the roomIndex from the list of excluded roomIndexes
      const roomIndexIndex = excludedRoomIndexes.indexOf(roomIndex);
      if (roomIndexIndex !== -1) {
        excludedRoomIndexes.splice(roomIndexIndex, 1);
      }
    } else {
      // If the room is not selected, select it and add to selectedRoomIndexes
      setSelectedRoomIndex((prevSelectedIndexes) => [
        ...prevSelectedIndexes,
        roomIndex,
        supplierCategoryId,
      ]);

      // Add the roomIndex to the list of excluded roomIndexes
      excludedRoomIndexes.push(roomIndex);
    }

    // Filter room combinations based on supplierCategoryId
    const matchingRoomCombinations = roomCombinationsArray.filter(
      (combination) =>
        combination.categoryId === supplierCategoryId &&
        combination.roomCombination.some((roomComb) =>
          roomComb.roomIndex.includes(roomIndex)
        )
    );

    if (matchingRoomCombinations.length > 0) {
      const selectedCombination = matchingRoomCombinations[0];

      if (selectedCombination.infoSource === "OpenCombination") {
        // Filter the roomCombination based on selected roomIndex and excluded roomIndexes
        const filteredRoomCombination =
          selectedCombination.roomCombination.filter((roomComb) =>
            roomComb.roomIndex.every(
              (index) => !excludedRoomIndexes.includes(index)
            )
          );
        // Update selectedCombinationCopy with the filtered roomCombination
        const selectedCombinationCopy = {
          ...selectedCombination,
          roomCombination: filteredRoomCombination,
        };

        if (filteredRoomCombination.length > 0) {
          const allowedRoomIndexes = filteredRoomCombination
            .map((roomComb) => roomComb.roomIndex)
            .flat();

          if (
            selectedRoomIndex.length >=
            selectedCombination.roomCombination.length
          ) {
            setAllowedRoomIndexes([]);
          } else {
            setAllowedRoomIndexes([...allowedRoomIndexes, supplierCategoryId]);
          }
        } else {
          // If no remaining combinations, set allowedRoomIndexes to an empty array
          setAllowedRoomIndexes([]);
        }
      } else {
        const allowedRoomIndexes = selectedCombination.roomCombination.find(
          (roomComb) => roomComb.roomIndex.includes(roomIndex)
        ).roomIndex;
        setAllowedRoomIndexes([...allowedRoomIndexes, supplierCategoryId]);
      }
    } else {
      const allRoomIndexes = rooms.map((room) => room.roomIndex);
      setAllowedRoomIndexes(allRoomIndexes);
    }

    const stateData = {
      selectedRoomIndex: selectedRoomIndex,
    };
    window.history.pushState(stateData, null, "");
  };

  return (
    <>
      <div className={style.hotelitem}>
        <div className={style.imgcolumn}>
          <Image
            className={style.hotelicon}
            src={src}
            // src={props.hotel.hotelImages}
            alt="Hotel image not found"
            width={500}
            height={500}
            onError={handleError}
          />
        </div>
        <div className={style.hotelbrief}>
          <div className={style.hotelname}>{props.hotel.hotelName}</div>
          <div className={style.inlinediv}>
            <div className={style.starDiv}>
              <StarRating rating={props.hotel.starRating} />
            </div>
          </div>
          <div className={style.hotellocality}>
            {props.hotelLocation || "India"}
            <div
              className={style.viewmore}
              onClick={() => {
                if (!viewMoreLoading) {
                  viewMoreOnClick(props.hotel.hotelCode);
                }
              }}
              aria-controls="collapse-text"
              aria-expanded={viewOpen}
              style={{ pointerEvents: disableClick ? "none" : "auto" }}
            >
              {viewMoreLoading
                ? "Loading... "
                : viewOpen
                ? "View less"
                : "View more"}
            </div>
          </div>
        </div>
        <div className={style.borderstroke}></div>
        <div className={style.column}>
          <div className={style.price}>
            Rs. {formatPrice(props.hotel.price.qOfferedPriceRoundedOff)}
          </div>
          <div
            className={style.solidbutton}
            onClick={() => {
              if (!loading) {
                selectRoomOnClick();
              }
            }}
            aria-controls="example-collapse-text"
            aria-expanded={open}
            style={{ pointerEvents: disableClick ? "none" : "auto" }}
          >
            {loading ? (
              <FontAwesomeIcon
                className={style.buttonSpinner}
                icon={faSpinner}
                spin
              />
            ) : (
              "View Rooms"
            )}
          </div>
        </div>
      </div>

      <Collapse in={open}>
        <div className={open ? "visible" : "hidden"}>
          <div className={style.roomlistexpanded}>
            <div>
              {rooms.map((room) => {
                return (
                  <RoomListItem
                    key={room.id}
                    room={room}
                    qTraceId={props.qTraceId}
                    hotel={props.hotel}
                    requestedRooms={props.requestedRooms}
                    checkinDate={props.checkinDate}
                    cityID={props.cityID}
                    onBookRoom={props.onBookRoom}
                    roomCombinationsArray={roomCombinationsArray}
                    isSelectable={isRoomSelectable(
                      room.roomIndex,
                      room.supplierCategoryId
                    )}
                    isSelected={isRoomSelected(
                      room.roomIndex,
                      room.supplierCategoryId
                    )}
                    handleRoomSelect={handleRoomSelect}
                    isReserveAllowed={isReserveAllowed}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </Collapse>

      <Collapse in={viewOpen}>
        <div className={viewOpen ? "visible" : "hidden"}>
          <ViewMoreDialog hotelInfo={hotelInfo} />
        </div>
      </Collapse>
    </>
  );
};
export default HotelListItem;
