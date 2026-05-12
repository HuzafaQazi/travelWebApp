import axios from "@/utils/axios/axios";
import config from "@/config";
import { NextRequest } from "next/server";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getTabSpecificData, setTabSpecificData, removeTabSpecificData } from "@/utils/axios/axios";

export async function saveCart(
  qTraceId,
  uuid,
  hotel,
  rooms,
  requestedRooms,
  checkinDate,
  checkoutDate,
  cityID,
  userId,
  totalNumberOfDays,
  userIp,
  totalNumberOfGuests,
  adults,
  children,
  totalCostRoom,
  totalRoomGSTAmount,
  totalCommissionAmount,
  companyId = null
) {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    const data = {
      id: null,
      cartId: uuid,
      userId: userId, //replace with phone number
      endUserIp: userIp,
      traceId: qTraceId,
      bookingStatus: "Pending",
      status: "Active",
      createdDate: null,
      modifiedDate: null,
      cartHotelDetails: {
        hotelIndex: "1",
        hotelCode: hotel.hotelCode,
        hotelName: hotel.hotelName,
        guestNationality: "IN",
        noOfRooms: requestedRooms,
        isVoucherBooking: "false",
        checkInDate: checkinDate,
        checkOutDate: checkoutDate,
        noOfGuests: totalNumberOfGuests,
        noOfNights: totalNumberOfDays,
        noOfAdults: adults,
        noOfChilds: children,
        totalBookingAmount: totalCostRoom,
        totalGstAmount: totalRoomGSTAmount,
        totalCommissionAmount: totalCommissionAmount,
        countryCode: "IN",
        cityId: cityID,
        cartHotelRoomDetails: rooms.map((room) => ({
          roomIndex: room.roomIndex,
          roomTypeCode: room.roomTypeCode,
          roomTypeName: room.roomTypeName,
          ratePlanCode: room.ratePlanCode,
          bedTypeCode: null,
          smokingPreference: room.smokingPreference,
          amenities: room.amenities[0],
          cartHotelRoomPriceDetails: {
            currencyCode: "INR",
            roomPrice: room.price.roomPrice,
            tax: room.price.tax,
            extraGuestCharge: room.price.extraGuestCharge,
            childCharge: room.price.childCharge,
            otherCharges: room.price.otherCharges,
            discount: room.price.discount,
            publishedPrice: room.price.publishedPrice,
            publishedPriceRoundedOff: room.price.publishedPriceRoundedOff,
            offeredPrice: room.price.offeredPrice,
            offeredPriceRoundedOff: room.price.offeredPriceRoundedOff,
            qOfferedPrice: room.price.qOfferedPrice,
            qOfferedPriceWithoutTax: room.price.qOfferedPriceWithoutTax,
            qOfferedPriceRoundedOff: room.price.qOfferedPriceRoundedOff,
            qCommission: room.price.qCommission,
            qCommissionTax: room.price.qCommissionTax,
            agentCommission: room.price.agentCommission,
            agentMarkUp: room.price.agentMarkUp,
            tds: room.price.TDS,
            serviceTax: room.price.serviceTax,
          },
          cartHotelRoomGuestDetails: null,
        })),
      },
    };
    if (companyId) {
      data.companyId = companyId;
    }
    console.log("save cart req: ", JSON.stringify(data));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const phoneNumber = useLocalStorage("phoneNumber");
    console.log("checkinDate is", checkinDate);
    const response = await axios
      .post(config.SAVE_CART, data, configuration)
      .then();
    console.log(`The save cart response is ${response.data}`);
    if (response.status === 200 && response.data.statusCode === 1000) {
      // closePopup(); // Close the popup when the response is successful
      return true;
    } else {
      console.log(
        "Got an error in save cart, stauts code is ",
        response.status,
        "Status is",
        response.data.statusCode
      );
      return false;
      // toast(`Error ${response.data}`);
    }
  } catch (error) {
    console.error("Went inside catch in save cart", error);
    return false;
    // toast(`Error ${error}`);
    // setErrorMsg(error);
  }
}

export async function getCart() {
  try {
    const req = {
      method: "GET",
      url: "/api/sample",
      query: { id: "123" },
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        // Add other headers as needed
      },
      body: JSON.stringify({ data: "sample data" }),
      // Add other properties as needed
    };
    // const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // console.log("getCart called", ip);
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      params: {
        userId: "123456u11",
      },
    };

    const response = await axios.get(`${config.GET_CART}`, configuration);

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling getCart", error);
    return error;
  }
}

export async function getBookingDetails(bookingId) {
  try {
    console.log("Get booking details called");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.GET_BOOKING_DETAILS}?bookingId=${bookingId}`,
      configuration
    );

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling getBookingDetails", error);
    return error;
  }
}

export async function validateGst(gstNumber) {
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.VERIFY_GST}?gstin=${gstNumber}`,
      configuration
    );

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling getBookingDetails", error);
    return error;
  }
}

export async function generateVoucher() {
  try {
    console.log("Generate voucher called");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.GENERATE_VOUCHER}`,
      {
        vendorcode: "qtravel001",
        VoucherDetails: {
          EndUserIp: "192.168.1.191",
          BookingId: "8378",
        },
      },
      configuration
    );

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling generate voucher", error);
    return error;
  }
}

export async function bookRoom(
  qTraceId,
  rooms,
  cartID,
  checkinDate,
  checkoutDate,
  getCityId,
  getCountryCode,
  totalCostRoom,
  selectedHotel,
  selectedRooms,
  reserveRoom,
  isPackageFare,
  blockResponse,
  isCorporateBooking,
  companyDetails,
  walletAmountDebited,
  totalPayable,
  companyId = null
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [getuserip, setuserip] = useLocalStorage("userip");
  const [getUserID, setUserID] = useLocalStorage("userID");
  const storedUserIp = getTabSpecificData("userip");
  let storedUserID = getTabSpecificData("userID");
  console.log("selected rooms =>", JSON.stringify(selectedRooms));
  // if(!storedUserID){
  //   storedUserID = "Q10012004";
  // }
  const isPackageDetailsMandatory =
    blockResponse.data.BlockRoomResult.IsPackageDetailsMandatory;

  console.log(`Book request made, url is ${config.BOOK_ROOM}`);
  console.log("rooms data: ", selectedRooms[0]);
  let qCommissionSum = 0;
  let qCommissionTaxSum = 0;

  selectedRooms.forEach((room) => {
    qCommissionSum += room.price.qCommission;
    qCommissionTaxSum += room.price.qCommissionTax;
  });
  const data = {
    BookRoomDetails: {
      HotelCode: selectedHotel.hotelCode,
      CategoryId: selectedRooms[0].supplierCategoryId,
      HotelName: blockResponse?.data?.BlockRoomResult?.HotelName,
      GuestNationality: "IN",
      NoOfRooms: rooms,
      IsVoucherBooking: (!JSON.parse(reserveRoom)).toString(),
      IsPackageFare: isPackageFare,
      CheckInDate: checkinDate,
      CheckOutDate: checkoutDate,
      CountryCode: getCountryCode.toString(),
      CityId: getCityId,
      TotalBookingAmount: totalCostRoom,
      TotalGstAmount: qCommissionTaxSum,
      WalletCreditApplied: walletAmountDebited,
      TotalPayable: totalPayable,
      IsCoorporateBooking: isCorporateBooking,
      CompantDetails: companyDetails,
      TotalCommissionAmount: qCommissionSum,
      ...(JSON.parse(isPackageFare) &&
        JSON.parse(isPackageDetailsMandatory) && {
          ArrivalTransport: {
            ArrivalTransportType:
              blockResponse?.data?.BlockRoomResult?.arrivalTransport
                ?.arrivalTransportType === "Flight"
                ? 0
                : 1,
            TransportInfoId:
              blockResponse?.data?.BlockRoomResult?.arrivalTransport
                ?.transportInfoId,
            Time: combineDateAndTime(
              blockResponse?.data?.BlockRoomResult?.arrivalTransport?.date,
              blockResponse?.data?.BlockRoomResult?.arrivalTransport?.time
            ),
          },
          DepartureTransport: {
            DepartureTransportType:
              blockResponse?.data?.BlockRoomResult?.departureTransport
                ?.departureTransportType === "Flight"
                ? 0
                : 1,
            TransportInfoId:
              blockResponse?.data?.BlockRoomResult?.departureTransport
                ?.transportInfoId,
            Time: combineDateAndTime(
              blockResponse?.data?.BlockRoomResult?.departureTransport?.date,
              blockResponse?.data?.BlockRoomResult?.departureTransport?.time
            ),
          },
        }),
      HotelRoomsDetails: selectedRooms.map((room) => ({
        RoomIndex: room.roomIndex,
        RoomTypeCode: room.roomTypeCode,
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
          qOfferedPrice: room.price.qOfferedPrice,
          qOfferedPriceWithoutTax: room.price.qOfferedPriceWithoutTax,
          qOfferedPriceRoundedOff: room.price.qOfferedPriceRoundedOff,
          qCommission: room.price.qCommission,
          qCommissionTax: room.price.qCommissionTax,
          AgentCommission: room.price.agentCommission,
          AgentMarkUp: room.price.agentMarkUp,
          ServiceTax: room.price.serviceTax,
          TDS: room.price.TDS,
          TCS: room.price.TCS,
        },
        HotelPassenger: [
          ...(room.adultsData
            ? room.adultsData.map((adult, i) => ({
                Title: adult.title,
                FirstName: adult.firstName.trim(),
                MiddleName: adult.middleName.trim(),
                LastName: adult.lastName.trim(),
                Phoneno: adult.mobileNumber === "" ? null : adult.mobileNumber,
                Email: adult.email === "" ? null : adult.email,
                PaxType: adult.paxType,
                LeadPassenger: i === 0 ? true : false,
                Age: adult.age,
                PassportNo: adult.passportNumber,
                PassportIssueDate:
                  adult.passportIssueDate != null
                    ? formatDateToISO(adult.passportIssueDate)
                    : null,
                PassportExpDate:
                  adult.passportExpDate != null
                    ? formatDateToISO(adult.passportExpDate)
                    : null,
                PAN: !JSON.parse(adult.isPANAvailable) ? adult.PAN : null,
                ...(JSON.parse(adult.isPANAvailable) && {
                  GuardianDetails: {
                    Title: adult.guardianDetails.title,
                    FirstName: adult.guardianDetails.firstName.trim(),
                    LastName: adult.guardianDetails.lastName.trim(),
                    PAN: adult.guardianDetails.PAN,
                  },
                }),
              }))
            : []),
          ...(room.childData
            ? room.childData.map((child) => ({
                Title: child.title,
                FirstName: child.firstName.trim(),
                MiddleName: child.middleName.trim(),
                LastName: child.lastName.trim(),
                Phoneno: child.mobileNumber === "" ? null : child.mobileNumber,
                Email: child.email === "" ? null : child.email,
                PaxType: child.paxType,
                LeadPassenger: child.leadPassanger,
                Age: child.age,
                PassportNo: child.passportNumber,
                PassportIssueDate:
                  child.passportIssueDate != null
                    ? formatDateToISO(child.passportIssueDate)
                    : null,
                PassportExpDate:
                  child.passportExpDate != null
                    ? formatDateToISO(child.passportExpDate)
                    : null,
                PAN: !JSON.parse(child.isPANAvailable) ? child.PAN : null,
                ...(JSON.parse(child.isPANAvailable) && {
                  GuardianDetails: {
                    Title: child.guardianDetails.title,
                    FirstName: child.guardianDetails.firstName.trim(),
                    LastName: child.guardianDetails.lastName.trim(),
                    PAN: child.guardianDetails.PAN,
                  },
                }),
              }))
            : []),
        ],
      })),
    },
    vendorcode: selectedHotel.vendorCode,
    cartId: cartID,
    qTraceId: qTraceId,
    userId: storedUserID,
    ipAddress: storedUserIp == "undefined" ? null : storedUserIp,
  };
  if (companyId) {
    data.companyId = companyId;
  }
  console.log("book req =>", JSON.stringify(data));
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    const response = await axios
      .post(config.BOOK_ROOM, data, configuration)
      .then();
    console.log(`The book response is ${JSON.stringify(response.data)}`);
    if (response.status === 200 && response.data.status === "SUCCESS") {
      // closePopup(); // Close the popup when the response is successful
      // setShowOTP(true);
      console.log("Success ", response);
      return response;
    } else {
      console.log("Went into else for book", response.data);
      // toast(`Error ${response.data}`);
    }
  } catch (error) {
    return error;
  }
}

function formatDateToISO(inputDateString) {
  const parts = inputDateString.split("-");
  const year = parts[2];
  const month = parts[1];
  const day = parts[0];
  const outputDateString = `${year}-${month}-${day}T00:00:00`;
  console.log("outputDateString =>", outputDateString);
  return outputDateString;
}

function combineDateAndTime(dateString, timeInSeconds) {
  const [day, month, year] = dateString.split("-");
  const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(timeInSeconds % 60).padStart(2, "0");
  let formattedDateTime;
  if (timeInSeconds) {
    formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  } else {
    formattedDateTime = `${year}-${month}-${day}T00:00:00`;
  }

  return formattedDateTime;
}

export async function blockRequest(
  qTraceId,
  uuid,
  hotel,
  rooms,
  requestedRooms,
  checkinDate,
  cityID,
  reserveRoom,
  roomCountString
) {
  console.log("hotel: ", hotel);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [getuserip, setuserip] = useLocalStorage("userip");
  const storedUserIp = getTabSpecificData("userip");
  // try {
  const configuration = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
  const response = await axios
    .post(
      `${config.BLOCK_ROOM}`,
      {
        BlockRoomDetails: {
          HotelCode: hotel.hotelCode,
          HotelName: hotel.hotelName,
          GuestNationality: "IN",
          NoOfRooms: requestedRooms.toString(),
          ClientReferenceNo: 0,
          IsVoucherBooking: reserveRoom.toString(),
          CategoryId: rooms[0].supplierCategoryId,
          HotelRoomsDetails: rooms.map((room) => ({
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
        vendorcode: hotel.vendorCode,
        cartId: uuid,
        ipAddress: storedUserIp == "undefined" ? null : storedUserIp,
        qTraceId: qTraceId,
        paxCountDetails: JSON.parse(roomCountString),
      },
      configuration
    )
    .then();
  console.log(`The block response is ${JSON.stringify(response.data)}`);
  if (response.status === 200 && response.data.status === "SUCCESS") {
    // closePopup(); // Close the popup when the response is successful
    // setShowOTP(true);
    return response.data;
  } else {
    console.log("Went into else for block", response.data);
    // toast(`Error ${response.data}`);
  }
  // }
  // catch (error) {
  //   console.error("Went into catch for block", error);
  //   // return error;
  // }
}

export async function blockRequestForBlcokResponse(
  qTraceId,
  uuid,
  hotel,
  rooms,
  requestedRooms,
  checkinDate,
  cityID,
  reserveRoom,
  selectedRooms,
  roomCountString,
  blockResponse
) {
  console.log("reserveRoom =>", reserveRoom);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [getuserip, setuserip] = useLocalStorage("userip");
  const storedUserIp = getTabSpecificData("userip");
  try {
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    const response = await axios
      .post(
        `${config.BLOCK_ROOM}`,
        {
          BlockRoomDetails: {
            HotelCode: hotel.hotelCode,
            HotelName: blockResponse.data.BlockRoomResult.HotelName,
            GuestNationality: "IN",
            NoOfRooms: requestedRooms.toString(),
            ClientReferenceNo: 0,
            IsVoucherBooking: !JSON.parse(reserveRoom),
            CategoryId: selectedRooms[0].supplierCategoryId,
            HotelRoomsDetails: rooms.map((room) => ({
              RoomIndex: room.RoomIndex,
              RoomTypeCode: room.RoomTypeCode,
              RoomDescription: room.RoomDescription,
              RoomTypeName: room.RoomTypeName,
              RatePlanCode: room.RatePlanCode,
              BedTypeCode: null,
              SmokingPreference: room.SmokingPreference,
              Supplements: null,
              Price: {
                CurrencyCode: room.Price.CurrencyCode,
                RoomPrice: room.Price.RoomPrice,
                Tax: room.Price.Tax,
                ExtraGuestCharge: room.Price.ExtraGuestCharge,
                ChildCharge: room.Price.ChildCharge,
                OtherCharges: room.Price.OtherCharges,
                Discount: room.Price.Discount,
                PublishedPrice: room.Price.PublishedPrice,
                PublishedPriceRoundedOff: room.Price.PublishedPriceRoundedOff,
                OfferedPrice: room.Price.OfferedPrice,
                OfferedPriceRoundedOff: room.Price.OfferedPriceRoundedOff,
                AgentCommission: room.Price.AgentCommission,
                AgentMarkUp: room.Price.AgentMarkUp,
                ServiceTax: room.Price.ServiceTax,
                TDS: room.Price.TDS,
                TCS: room.Price.TCS,
              },
            })),
          },
          vendorcode: hotel.vendorCode,
          cartId: uuid,
          ipAddress: storedUserIp == "undefined" ? null : storedUserIp,
          qTraceId: qTraceId,
          paxCountDetails: JSON.parse(roomCountString),
        },
        configuration
      )
      .then();
    console.log(`The block response is ${JSON.stringify(response.data)}`);
    if (response.status === 200 && response.data.status === "SUCCESS") {
      // closePopup(); // Close the popup when the response is successful
      // setShowOTP(true);
      return response.data;
    } else {
      console.log("Went into else for block", response.data);
      // toast(`Error ${response.data}`);
    }
  } catch (error) {
    return error;
    console.error("Went into catch for block", error);
  }
}

export async function saveGuests() {
  try {
    console.log("Save guests called, url is ", config.SAVE_GUESTS);
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.post(
      `${config.SAVE_GUESTS}`,
      {
        userId: "hjad6557jfyr66",
        isAddedFromCart: "true",
        cartId: "1005",
        title: "Mr",
        firstName: "Ashwath",
        middleName: "M",
        lastName: "G",
        phone: "9123456789",
        email: "ashwath.govekar@quinta.co.in",
        paxType: 1,
        leadPassenger: "true",
        age: 25,
        passportNo: "IN5678TH8901563",
        passportIssueDate: "2022-01-31",
        passportExpDate: "2029-12-31",
        pan: "ABCDE1234F",
        status: "Active",
      },
      configuration
    );

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling save guests", error);
    return error;
  }
}

export async function getUsersByCartID() {
  try {
    console.log("Get users by cart id called");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.get(
      `${config.GET_GUESTS_BY_CART_ID}/1005`,
      configuration
    );

    return response.data;
  } catch (error) {
    console.error(
      "An error occurred while calling get users by cart id",
      error
    );
    return error;
  }
}

export async function getUsersByUserID() {
  try {
    console.log("Get users by cart id called");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.get(
      `${config.GET_GUESTS_BY_USER_ID}/hjad6557jfyr66`,
      configuration
    );

    return response.data;
  } catch (error) {
    console.error(
      "An error occurred while calling get users by user id",
      error
    );
    return error;
  }
}

export async function updateGuest() {
  try {
    console.log("Update guest called");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.put(
      `${config.UPDATE_GUEST}`,
      {
        id: 2,
        userId: "sdfsdfdsf",
        isAddedFromCart: "true",
        cartId: "1001",
        title: "Mr",
        firstName: "Ashwath",
        middleName: "M",
        lastName: "Govekar",
        phone: "9743712457",
        email: "ashwathgovekar@gmail.com",
        paxType: 1,
        leadPassenger: "true",
        age: 20,
        passportNo: "IN5678TH8901563",
        passportIssueDate: "2022-12-31",
        passportExpDate: "2029-12-31",
        pan: "ABCDE1234F",
        status: "Active",
      },
      configuration
    );

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling update guest", error);
    return error;
  }
}

export async function deleteGuest() {
  try {
    console.log("Delete guest called");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.delete(
      `${config.DELETE_GUEST}/2`,
      configuration
    );

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling delete guest", error);
    return error;
  }
}

export async function getPaymentGateway() {
  try {
    console.log("getPaymentGateway called");
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const response = await axios.get(config.GET_PAYMENT_GATEWAY, configuration);

    return response.data;
  } catch (error) {
    console.error("An error occurred while calling getPaymentGateway", error);
    return error;
  }
}

export async function getPaymentSessionID(
  redirectUrl,
  walletAmount,
  charges,
  paymentCategory,
  bookingID,
  amount,
  phoneNumber,
  pgCode,
  travelCategory,
  bookingPaymentRef = null,
  companyId = null
) {
  try {
    const payload = {
      pgCode: pgCode,
      bookingId: `${bookingID}`,
      orderAmount: Math.round(amount),
      orderCurrency: "INR",
      customerDetails: {
        customerName: null,
        customerEmail: null,
        customerPhone: phoneNumber,
      },
      paymentCategory: paymentCategory,
      charges: charges,
      walletAmount: walletAmount,
      redirectUrl: redirectUrl,
      ...(companyId && { companyId }),
    };
    if (travelCategory) {
      payload.travelCategory = travelCategory;
    } else {
      payload.travelCategory = "1";
    }
    if (bookingPaymentRef) {
      payload.bookingPaymentRefIds = bookingPaymentRef.bookingPaymentRefIds;
      payload.isWeb = bookingPaymentRef.isWeb;
    }
    let formattedAmount = parseFloat(amount).toFixed(2);
    const configuration = {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
    const response = await axios.post(
      `${config.GET_SESSION_ID}`,
      payload,
      configuration
    );

    return response;
  } catch (error) {
    console.error("An error occurred while calling getBookingDetails", error);
    return error;
  }
}
