import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { formatPrice } from "@/utils/common";
import showToast from "@/utils/toast";
import useIndexedDBWithCompression from "@/utils/corporate/hotels/useIndexedDB";
import axios, { getTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import style from "./style.module.css";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OutOfPolicy from "@/components/corporate/common/OutOfPolicy";
import InPolicyTooltip from "@/components/corporate/booking/flights/outOfPolicyToolTip";
import {
  TRAVEL_CATEGORIES,
  HOTEL_BUDGET_DOMESTIC_ID,
  HOTEL_BUDGET_INTERNATIONAL_ID,
  HOTEL_INPOLICY_CONTENT,
} from "@/utils/constants";
import {
  constructOutOfPolicyEmployees,
  findTravelersMissingApproval,
} from "@/utils/corporate/travelPolicy";

const RefundableBadge = ({ isRefundable }) => {
  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${
        isRefundable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isRefundable ? "Refundable" : "Non-Refundable"}
    </span>
  );
};

const ViewRoom = ({
  onClose,
  data,
  maxRooms,
  selectedHotel,
  searchRequest,
  onSelectedRoomsChange,
}) => {
  console.log("the the search request is", searchRequest);
  const router = useRouter();
  const { savePreviewData } = useIndexedDBWithCompression();

  const [allowedRoomIndexes, setAllowedRoomIndexes] = useState([]);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredRoomIndex, setHoveredRoomIndex] = useState(null);
  const [hoveredButtonIndex, setHoveredButtonIndex] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Initially, set allowedRoomIndexes to include all room indexes
    const initialAllowedRoomIndexes = data?.HotelRoomsResults?.map(
      (room) => room.roomIndex
    );
    setAllowedRoomIndexes(initialAllowedRoomIndexes);
  }, [data.HotelRoomsResults]);

  useEffect(() => {
    if (selectedRoomIndex.length !== selectedRooms.length) {
      // Filter out room indexes that are not present in selectedRooms
      setSelectedRoomIndex((prevSelectedIndexes) =>
        prevSelectedIndexes.filter((index) =>
          selectedRooms?.some(
            (room) =>
              room.roomIndex === index || room.supplierCategoryId === index
          )
        )
      );
    }
  }, [selectedRooms]);

  useEffect(() => {
    if (onSelectedRoomsChange) {
      onSelectedRoomsChange(selectedRooms);
    }
  }, [selectedRooms, onSelectedRoomsChange]);

  const checkIfRoomRefundable = (room) => {
    if (!room?.cancellationPolicies?.length) {
      return false; // no policy => assume non-refundable (or adapt your logic)
    }

    const now = new Date();

    // We'll check the "offeredPrice" for the total cost:
    const totalRoomCost = room.price?.qOfferedPriceRoundedOff || 0;

    // If we find *any* window with penalty less than the full cost (or <100%):
    for (const policy of room.cancellationPolicies) {
      // Check if this policy window starts in the future
      const policyStart = new Date(policy.FromDate);
      if (policyStart > now) {
        // Now interpret the charge
        if (policy.ChargeType === 2) {
          // charge is a percentage
          if (policy.Charge < 100) {
            // means user doesn’t lose 100% => partially refundable
            return true;
          }
        } else if (policy.ChargeType === 1) {
          // charge is a direct currency value
          // if it's less than total cost => partial refund => consider refundable
          if (policy.Charge < totalRoomCost) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isRoomSelectable = (roomIndex, supplierCategoryId) => {
    if (
      data.hotelCode !== selectedHotel.hotelCode &&
      selectedHotel.hotelCode !== undefined
    )
      return true;
    if (selectedRooms?.length === 0) return true;
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
      data.hotelCode !== selectedHotel.hotelCode &&
      selectedHotel.hotelCode !== undefined
    )
      return false;
    // if (selectedRooms?.length === 0) return true;
    if (
      selectedRoomIndex.includes(roomIndex) &&
      selectedRoomIndex.includes(supplierCategoryId)
    )
      return true;

    return false;
  };

  const handleRoomSelect = (roomIndex, supplierCategoryId) => {
    if (
      data.hotelCode !== selectedHotel.hotelCode &&
      selectedHotel.hotelCode !== undefined
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
    const matchingRoomCombinations = data.roomCombinationsArray.filter(
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
      const allRoomIndexes = data.HotelRoomsResults.map(
        (room) => room.roomIndex
      );
      setAllowedRoomIndexes(allRoomIndexes);
    }
  };

  // Handle "Add Room" click
  const handleAddRoom = (room) => {
    handleRoomSelect(room.roomIndex, room.supplierCategoryId);
    setSelectedRooms((prev) => [...prev, room]);
  };

  const handleRemoveRoom = (roomIndex, supplierCategoryId) => {
    setSelectedRoomIndex((prevSelectedIndexes) =>
      prevSelectedIndexes.filter(
        (_, idx) =>
          // Remove both roomIndex and the supplierCategoryId that follows it
          !(
            prevSelectedIndexes[idx] === roomIndex &&
            prevSelectedIndexes[idx + 1] === supplierCategoryId
          ) &&
          !(
            prevSelectedIndexes[idx] === supplierCategoryId &&
            prevSelectedIndexes[idx - 1] === roomIndex
          )
      )
    );

    setSelectedRooms((prevSelectedRooms) =>
      prevSelectedRooms.filter(
        (room) =>
          !(
            room.roomIndex === roomIndex &&
            room.supplierCategoryId === supplierCategoryId
          )
      )
    );
  };

  const calculateTotalPrice = () => {
    return selectedRooms.reduce(
      (total, room) => total + room.price.qOfferedPriceRoundedOff,
      0
    );
  };

  const handleProceedToReview = async () => {
    setLoading(true);
    try {
      // Perform validations
      if (selectedRooms.length !== maxRooms) {
        showToast("info", `Please select exactly ${maxRooms} room(s).`);
        return;
      }

      // Check if the allowed combinations are the only ones selected
      const selectedCombinations = [];
      for (let i = 0; i < selectedRoomIndex.length; i += 2) {
        selectedCombinations.push([
          selectedRoomIndex[i],
          selectedRoomIndex[i + 1],
        ]);
      }

      const isAllSelectedCombinationsAllowed = selectedCombinations.every(
        ([roomIndex, categoryId]) =>
          allowedRoomIndexes.includes(roomIndex) &&
          allowedRoomIndexes.includes(categoryId)
      );

      if (!isAllSelectedCombinationsAllowed) {
        showToast(
          "info",
          "You have selected a room combination that is not allowed."
        );
        return;
      }
      const ipAddress = getTabSpecificData("userip")?.replace(/"/g, "");

      const payload = {
        BlockRoomDetails: {
          HotelCode: selectedHotel.hotelCode,
          HotelName: selectedHotel.hotelName,
          GuestNationality: "IN",
          NoOfRooms: searchRequest.noOfRooms.toString(),
          ClientReferenceNo: 0,
          IsVoucherBooking: true,
          CategoryId: selectedRooms[0].supplierCategoryId,

          HotelRoomsDetails: selectedRooms.map((room) => ({
            RoomIndex: room.roomIndex,
            RoomTypeCode: room.roomTypeCode,
            RoomDescription: room.roomDescription,
            RoomTypeName: room.roomTypeName,
            RatePlanCode: room.ratePlanCode,
            BedTypeCode: null,
            SmokingPreference: room.smokingPreference,
            Supplements: null,
            Price: {
              CurrencyCode: room.price.currencyCode,
              RoomPrice: room.price.roomPrice,
              Tax: room.price.tax,
              ExtraGuestCharge: room.price.extraGuestCharge,
              ChildCharge: room.price.childCharge,
              OtherCharges: room.price.otherCharges,
              Discount: room.price.discount,
              PublishedPrice: room.price.publishedPrice,
              PublishedPriceRoundedOff: room.price.publishedPriceRoundedOff,
              OfferedPrice: room.price.offeredPrice,
              OfferedPriceRoundedOff: room.price.offeredPriceRoundedOff,
              AgentCommission: room.price.agentCommission,
              AgentMarkUp: room.price.agentMarkUp,
              ServiceTax: room.price.serviceTax,
              TDS: room.price.TDS,
              TCS: room.price.TCS,
            },
          })),
        },
        vendorcode: selectedHotel.vendorCode,
        cartId: null,
        ipAddress: typeof ipAddress == "undefined" ? null : ipAddress,
        qTraceId: data.qTraceId,
        paxCountDetails: searchRequest.roomGuests,
      };

      const response = await axios.post(`${config.BLOCK_ROOM}`, payload);
      const blockRoomResponse = response?.data?.data;
      if (response.data.status === "SUCCESS") {
        if (
          blockRoomResponse?.BlockRoomResult?.AvailabilityType === "Confirm"
        ) {
          savePreviewData(
            selectedHotel,
            selectedRooms,
            searchRequest,
            blockRoomResponse
          );
          if (sessionStorage.getItem("selectedHotelData")) {
            sessionStorage.removeItem("selectedHotelData");
          }

          await router.push("/bookings/hotels/review");
        } else {
          showToast("info", "Hotel is not available now");
        }
      } else {
        showToast("error", "Something went wrong, please try again later!");
      }
    } catch (error) {
      console.error(error);
      let errorMessage =
        error?.response?.data?.message ||
        "Something went wrong, please try again later!";
      if (
        error?.response?.data?.message ===
          "Your session (TraceId) is expired." ||
        error?.response?.data?.error?.ErrorMsg ===
          "Your session (TraceId) is expired."
      ) {
        errorMessage =
          "Oops! Your session has expired. Please search Hotels again.";
        router.push("/");
      }

      // Display the message in the toast
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getChargeDisplay = (policy) => {
    switch (policy.ChargeType) {
      case 1:
        return `${formatPrice(policy.Charge)} ${policy.Currency}`;
      case 2:
        return `${policy.Charge}%`;
      case 3:
        return `${policy.Charge} Nights`;
      default:
        return "N/A";
    }
  };

  const processCancellationPolicies = (cancellationPolicies) => {
    const now = new Date();
    const policies = [];

    // Free Cancellation
    if (
      cancellationPolicies.length > 0 &&
      now < new Date(cancellationPolicies[0].FromDate)
    ) {
      policies.push({
        fromDate: "Now",
        toDate: formatDate(cancellationPolicies[0].FromDate),
        charges: "Free Cancellation",
      });
    }

    // Add the remaining policies
    cancellationPolicies.forEach((policy) => {
      policies.push({
        fromDate: formatDate(policy.FromDate),
        toDate: formatDate(policy.ToDate),
        charges: getChargeDisplay(policy),
      });
    });

    return policies;
  };

  const regionId = selectedHotel?.isDomesticHotel
    ? HOTEL_BUDGET_DOMESTIC_ID
    : HOTEL_BUDGET_INTERNATIONAL_ID;

  const rawTotalSelectedPrice = useMemo(() => {
    return selectedRooms.reduce(
      (acc, room) => acc + (room.price?.qOfferedPriceRoundedOff || 0),
      0
    );
  }, [selectedRooms]);

  const costDividedByRoomCount = useMemo(() => {
    if (!searchRequest?.noOfRooms || searchRequest.noOfRooms === 0) return 0;
    return rawTotalSelectedPrice / searchRequest.noOfRooms;
  }, [rawTotalSelectedPrice, searchRequest?.noOfRooms]);

  const allSelectedRoomsAreRefundable = useMemo(() => {
    // If no selected rooms => let's say "false" or adapt as needed
    if (!selectedRooms.length) return false;
    return selectedRooms.every((room) => checkIfRoomRefundable(room));
  }, [selectedRooms]);

  // 3) Get "Out of Policy" info for the aggregated booking
  const aggregatedOutOfPolicy = useMemo(() => {
    if (!searchRequest?.selectedTravelers?.length) return [];
    const policyData = {
      totalAmount: costDividedByRoomCount,
      regionId,
      corporateEmployees: searchRequest.selectedTravelers,
      showApprovalReason: false,
      isRefundable: allSelectedRoomsAreRefundable,
    };
    return constructOutOfPolicyEmployees(policyData, TRAVEL_CATEGORIES.HOTELS, {
      budgetCheckMethod: "split",
    });
  }, [
    costDividedByRoomCount,
    regionId,
    searchRequest,
    allSelectedRoomsAreRefundable,
  ]);

  // If there's at least one out-of-policy traveler, we can display a badge or something
  const isBookingOutOfPolicy = aggregatedOutOfPolicy.length > 0;

  // 4) Check if we must disable button (some employees require approval)
  const isApprovalRequiredBooking = useMemo(() => {
    if (!searchRequest?.selectedTravelers?.length) return false;
    return findTravelersMissingApproval(
      {
        corporateEmployees: searchRequest.selectedTravelers,
        totalAmount: costDividedByRoomCount,
        regionId,
        isRefundable: allSelectedRoomsAreRefundable,
        showApprovalReason: false,
      },
      TRAVEL_CATEGORIES.HOTELS
    );
  }, [
    searchRequest,
    costDividedByRoomCount,
    regionId,
    allSelectedRoomsAreRefundable,
  ]);

  return (
    <>
      <div>
        <div className="flex justify-end"></div>
        <div className="text-[#171A19] font-semibold text-lg">
          {/* {selectedHotel.hotelName} */}Please select the Room
        </div>

        <div className={style.ViewRoomContainer}>
          {data?.HotelRoomsResults?.map((room, index) => {
            const isSelectable = isRoomSelectable(
              room.roomIndex,
              room.supplierCategoryId
            );
            const isSelected = isRoomSelected(
              room.roomIndex,
              room.supplierCategoryId
            );

            const singleRoomRefundable = checkIfRoomRefundable(room);

            const singleRoomOutOfPolicy = constructOutOfPolicyEmployees(
              {
                totalAmount: room.price?.qOfferedPriceRoundedOff || 0,
                regionId,
                corporateEmployees: searchRequest?.selectedTravelers,
                isRefundable: singleRoomRefundable,
              },
              TRAVEL_CATEGORIES.HOTELS,
              { budgetCheckMethod: "split" }
            );

            const isSingleRoomOutOfPolicy = singleRoomOutOfPolicy.length > 0;

            const isSingleRoomApprovalRequired = findTravelersMissingApproval(
              {
                corporateEmployees: searchRequest?.selectedTravelers || [],
                totalAmount: room.price.qOfferedPriceRoundedOff,
                regionId: regionId,
                isRefundable: singleRoomRefundable,
                showApprovalReason: false,
              },
              TRAVEL_CATEGORIES.HOTELS
            );

            const roomStyle = isSelected
              ? "bg-green-100 border border-green-400 shadow-md"
              : isSelectable
              ? "bg-white"
              : "bg-gray-200 pointer-events-none";

            return (
              <div
                key={index}
                className={`mt-4 p-4 rounded-lg border-1 border-[#155EEF50] ${roomStyle}`}
              >
                <div className="text-[#171A19] flex flex-col gap-1 font-medium text-base py-1">
                  {room.roomTypeName}
                  <RefundableBadge isRefundable={singleRoomRefundable} />
                </div>

                <div
                  className="relative inline-block group"
                  onMouseEnter={() => setHoveredRoomIndex(index)}
                  onMouseLeave={() => setHoveredRoomIndex(null)}
                >
                  <button class=" text-[#155EEF] px-1 py-0 rounded-md underline">
                    Cancellation Policy
                  </button>
                  {hoveredRoomIndex === index && (
                    <div className="absolute hidden group-hover:block top-full mt-0 -left-[40%] sm:left-0 w-fit p-2 border border-gray-300 z-[50] rounded-md shadow-md bg-white">
                      <table className="sm:w-[550px] text-sm text-center border-collapse">
                        <thead className="bg-[#155EEF] text-white">
                          <tr>
                            <th className="px-2 py-1 border ">Room</th>
                            <th className="px-2 py-1 border ">
                              Cancelled on or After
                            </th>
                            <th className="px-2 py-1 border ">
                              Cancelled on or Before
                            </th>
                            <th className="px-2 py-1 border ">
                              Cancellation Charges
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {room.cancellationPolicies.map((policy, i) => (
                            <tr key={i} className="text-gray-800">
                              <td className="px-2 py-1 border">
                                {room.roomTypeName}
                              </td>
                              <td className="px-2 py-1 border">
                                {formatDate(policy.FromDate)}
                              </td>
                              <td className="px-2 py-1 border">
                                {formatDate(policy.ToDate)}
                              </td>
                              <td className="px-2 py-1 border">
                                {getChargeDisplay(policy)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  {room.inclusion.length > 0 ? (
                    <div className="flex flex-col">
                      <div className="text-[#030B09] font-semibold text-sm">
                        This room includes:{" "}
                      </div>
                      <div className="text-[#030B09] font-normal text-sm">
                        {room.inclusion.join(" | ")}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[#030B09] font-normal text-sm">
                      No meals included{" "}
                    </div>
                  )}

                  <div className="flex flex-col items-end">
                    <div className="text-[#030B09] font-medium text-lg text-right mr-1">
                      Rs {formatPrice(room.price.qOfferedPriceRoundedOff)}
                    </div>
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredButtonIndex(index)}
                      onMouseLeave={() => setHoveredButtonIndex(null)}
                    >
                      <button
                        className={`bg-white border border-[#155EEF50] text-[#155EEF] p-1 px-2 rounded-2xl ${
                          (!isSelectable && !isSelected) ||
                          isSingleRoomApprovalRequired
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        style={{ boxShadow: "0px 4px 4px 0px #7D99B417" }}
                        onClick={() =>
                          !isSingleRoomApprovalRequired
                            ? !isSelected
                              ? handleAddRoom(room)
                              : handleRemoveRoom(
                                  room.roomIndex,
                                  room.supplierCategoryId
                                )
                            : null
                        }
                        disabled={
                          (!isSelectable && !isSelected) ||
                          isSingleRoomApprovalRequired
                        }
                      >
                        {isSelected ? "Remove Room" : "Add Room"}
                      </button>
                      {isSingleRoomApprovalRequired &&
                        hoveredButtonIndex === index && (
                          <InPolicyTooltip content={HOTEL_INPOLICY_CONTENT} />
                        )}
                    </div>

                    {isSingleRoomOutOfPolicy && (
                      <OutOfPolicy
                        outOfPolicyTravelers={singleRoomOutOfPolicy}
                        badgeClassName="text-[#E53944] text-sm font-semibold items-center mt-2 flex gap-1"
                      />
                    )}
                  </div>
                </div>
                {room.amenity?.length > 0 && (
                  <div className="text-[#030B09] font-normal text-sm mt-1">
                    <strong>Amenities:</strong>
                    <ul className="list-disc ml-5 mt-1">
                      {room.amenity.map((amenity, i) => (
                        <li key={i}>{amenity}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!isSelectable && !isSelected && (
                  <div className="text-red-500 text-xs mt-2">
                    This room is not available with the current selection.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedRooms.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full p-3 py-1 px-4 bg-[#155EEF] shadow-lg z-50 flex justify-between items-center text-white">
            {/* <div className="flex flex-col justify-center items-left">
              <div className="text-sm sm:text-base font-semibold">
                {selectedRooms.length} Room
                {selectedRooms.length > 1 ? "s" : ""} *{" "}
                {searchRequest?.adultsPerRoom?.reduce(
                  (total, adults) => total + adults,
                  0
                )}{" "}
                {searchRequest?.adultsPerRoom?.reduce(
                  (total, adults) => total + adults,
                  0
                ) > 1
                  ? "Adults"
                  : "Adult"}{" "}
                * {searchRequest.noOfNights} Night
                {parseInt(searchRequest.noOfNights) > 1 ? "s" : ""}
              </div>
              <div className="text-xs sm:text-sm font-semibold">
                Room{selectedRooms.length > 1 ? "s" : ""}:{" "}
                {selectedRooms
                  .map(
                    (room) =>
                      data.HotelRoomsResults.find(
                        (r) => r.roomIndex === room.roomIndex
                      ).roomTypeName
                  )
                  .join(", ")}
              </div>
            </div> */}

            <div className="flex flex-col justify-center items-left">
              {/* Calculate totals for adults, children, and infants from response */}
              {(() => {
                const adultsPerRoom =
                  searchRequest?.roomDetails?.map((room) =>
                    Number(room.adults)
                  ) || [];
                const totalAdults =
                  adultsPerRoom.reduce((total, adults) => total + adults, 0) ||
                  0;

                const childrenPerRoom =
                  searchRequest?.roomDetails?.map((room) =>
                    Number(room.children)
                  ) || [];
                const totalChildren =
                  childrenPerRoom.reduce(
                    (total, children) => total + children,
                    0
                  ) || 0;

                // const infantsPerRoom = response?.roomDetails?.map((room) => Number(room.infants)) || [];
                // const totalInfants = infantsPerRoom.reduce((total, infants) => total + infants, 0) || 0;

                return (
                  <div className="text-sm sm:text-base font-semibold">
                    {selectedRooms.length}{" "}
                    {selectedRooms.length === 1 ? "Room" : "Rooms"} |{" "}
                    {searchRequest?.noOfNights}{" "}
                    {parseInt(searchRequest?.noOfNights) === 1
                      ? "Night"
                      : "Nights"}{" "}
                    | {totalAdults} {totalAdults === 1 ? "Adult" : "Adults"}
                    {totalChildren > 0
                      ? ` | ${totalChildren} ${
                          totalChildren === 1 ? "Child" : "Children"
                        }`
                      : ""}
                    {/* {totalInfants > 0 ? ` | ${totalInfants} ${totalInfants === 1 ? "Infant" : "Infants"}` : ""} */}
                  </div>
                );
              })()}

              <div className="text-xs sm:text-sm font-semibold">
                Room{selectedRooms.length > 1 ? "s" : ""}:{" "}
                {selectedRooms
                  .map(
                    (room) =>
                      data.HotelRoomsResults.find(
                        (r) => r.roomIndex === room.roomIndex
                      ).roomTypeName
                  )
                  .join(", ")}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-1/3 items-right justify-center">
              <div className="flex gap-3">
                {isBookingOutOfPolicy && (
                  <OutOfPolicy
                    outOfPolicyTravelers={aggregatedOutOfPolicy}
                    badgeClassName="text-[#E53944] text-sm font-semibold items-center flex gap-1"
                  />
                )}
                <div className="text-base sm:text-lg font-semibold mt-0 sm:mt-2 text-center">
                  Total: Rs {formatPrice(calculateTotalPrice())}
                </div>
              </div>

              <div
                className="relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <button
                  disabled={loading || isApprovalRequiredBooking}
                  className={`bg-white text-[#155EEF] w-full mx-0 sm:mx-[25%] text-xxs sm:text-base py-2 px-4 rounded-lg  ${
                    isApprovalRequiredBooking
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  }`}
                  style={{ boxShadow: "0px 4px 4px 0px #7D99B417" }}
                  onClick={
                    !isApprovalRequiredBooking ? handleProceedToReview : null
                  }
                >
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    "Proceed to Review"
                  )}
                </button>
                {isApprovalRequiredBooking && isHovered && (
                  <InPolicyTooltip content={HOTEL_INPOLICY_CONTENT} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewRoom;
