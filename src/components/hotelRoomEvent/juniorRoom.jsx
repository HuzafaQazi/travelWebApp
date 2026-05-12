import { useState } from "react";
import { Coffee, Wifi, Square, Check, X, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function JuniorSuiteBooking({
  destination,
  roomsData,
  checkinDate,
  checkoutDate,
  roomType,
  availableRooms,
  numberOfRooms,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOccupancy, setSelectedOccupancy] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const images = [
    "/img/event/2.jpg",
    "/img/event/2.jpg",
    "/img/event/3.jpg",
    "/img/event/4.jpg",
    "/img/event/5.jpg",
    "/img/event/6.jpg",
    "/img/event/7.jpg",
  ];

  const visibleImages = images.slice(0, 3); // Show only first 3 images
  const hiddenImages = images.length - visibleImages.length; // Count of hidden images

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const categories = ["King Bed Non-Smoking Room", "King Bed Smoking Room"];

  const occupancyTypes = ["Single Occupancy", "Double Occupancy"];

  const priceData = {
    "King Bed Non-Smoking Room": {
      "Single Occupancy": 5025.2,
      "Double Occupancy": 5525.2,
    },
    "King Bed Smoking Room": {
      "Single Occupancy": 4825.2,
      "Double Occupancy": 5325.2,
    },
  };

  const getCurrentPrice = () => {
    if (selectedCategory && selectedOccupancy) {
      return priceData[selectedCategory]?.[selectedOccupancy] || 5025.2;
    }
    return 5025.2; // Default price
  };

  const handleSelect = async () => {
    if (availableRooms === 0) {
      showToast("error", "No rooms available");
      return;
    }

    if (!selectedCategory || !selectedOccupancy) {
      showToast("error", "Please select both a category and occupancy type.");
      return;
    }

    setIsLoading(true);
    try {
      const bookingDetails = {
        roomName: "Junior Suite Room",
        roomType,
        numberOfRooms,
        destination,
        guests: roomsData,
        category: selectedCategory,
        occupancy: selectedOccupancy,
        price: getCurrentPrice(),
        checkinDate,
        checkoutDate,
      };

      const compressedData = pako.deflate(JSON.stringify(bookingDetails));
      sessionStorage.setItem("eventBookingData", compressedData);
      sessionStorage.removeItem("eventBookingCab");
      sessionStorage.removeItem("eventBookingAddons");

      await router.push("/CIT-95/Addonform");
    } catch (error) {
      console.error("something went wrong while select", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mx-2 mt-1 border border-gray-200">
      <div className="flex flex-col  justify-between">
        <div className=" flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800">Junior Suite</h2>
            <p className="text-gray-600 mt-1 text-sm">{destination}</p>

            {checkinDate && checkoutDate && (
              <p className="text-gray-500 text-sm">
                {checkinDate} - {checkoutDate}
              </p>
            )}
            <div className="relative mt-2 lg:mt-0">
              {/* Grid Layout for 3 Images */}
              <div className="grid grid-cols-2 gap-2">
                {/* Large Top Image */}
                <div className="col-span-2">
                  <Image
                    src={visibleImages[0]}
                    alt="Image 1"
                    width={320}
                    height={200}
                    className="rounded-lg object-cover w-full h-[150px] cursor-pointer"
                    onClick={() => openModal(0)}
                  />
                </div>

                {/* Bottom Two Smaller Images */}
                {visibleImages.slice(1).map((img, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={img}
                      alt={`Image ${index + 2}`}
                      width={150}
                      height={100}
                      className="rounded-lg object-cover h-[100px] w-full cursor-pointer"
                      onClick={() => openModal(index + 1)}
                    />

                    {/* Overlayed "+X" Button on Last Image */}
                    {index === 1 && hiddenImages > 0 && (
                      <div
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg cursor-pointer"
                        onClick={() => openModal(2)}
                      >
                        <span className="text-white font-bold text-lg">
                          +{hiddenImages}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Modal for Image Preview */}
              {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-4 rounded-lg shadow-lg max-w-lg w-full relative flex flex-col items-center">
                    {/* Close Button */}
                    <button
                      onClick={closeModal}
                      className="absolute top-2 right-2 text-gray-600 text-xl"
                    >
                      ✖
                    </button>

                    {/* Image Preview */}
                    <Image
                      src={images[currentIndex]}
                      alt={`Image ${currentIndex + 1}`}
                      width={400}
                      height={300}
                      className="rounded-lg"
                    />

                    {/* Navigation Buttons */}
                    <div className="flex justify-between w-full mt-4">
                      <button
                        onClick={goPrev}
                        className="px-4 py-2 bg-gray-300 rounded-md"
                      >
                        ⬅ Previous
                      </button>
                      <button
                        onClick={goNext}
                        className="px-4 py-2 bg-gray-300 rounded-md"
                      >
                        Next ➡
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-[50%]">
            <div className="absolute top-4 right-4 lg:relative lg:top-0 lg:right-0 lg:mt-4 lg:text-right">
              <span className="bg-orange-400 text-white px-3 py-1 rounded-full text-sm">
                only {availableRooms} rooms left
              </span>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-md p-4 border rounded-lg shadow-lg bg-white">
              {/* Category Dropdown */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Category Bifurcation
                </label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Occupancy Dropdown */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Occupancy Type
                </label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedOccupancy}
                  onChange={(e) => setSelectedOccupancy(e.target.value)}
                >
                  <option value="" disabled>
                    Select occupancy type
                  </option>
                  {occupancyTypes.map((occupancy, index) => (
                    <option key={index} value={occupancy}>
                      {occupancy}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between flex-1 mt-6 sm:mt-2 ">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Room at a glance
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                Max. guests: 3 adults
              </span>
              <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                Bed type: 1 king
              </span>
              <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                Size: 495 ft²
              </span>
            </div>

            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-center">
                <Wifi className="text-gray-600" size={20} />
              </div>
              <div className="flex items-center">
                <Coffee className="text-gray-600" size={20} />
              </div>
              <div className="flex items-center">
                <Square className="text-gray-600" size={20} />
              </div>
              <div className="flex items-center">
                <div className="border border-gray-600 rounded-md p-1">
                  <Square className="text-gray-600" size={16} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Meal plan:</h3>
              <div className="border border-gray-400 rounded-full px-4 py-2 inline-flex items-center">
                <Coffee className="text-gray-600 mr-2" size={20} />
                <span className="font-medium">Breakfast included</span>
              </div>
            </div>

            <a
              href="#"
              className="text-red-600 font-medium mt-2 flex items-center"
            >
              ROOM DETAILS <ChevronRight size={16} />
            </a>
          </div>
          <div className="mt-6 lg:mt-0 p-4 text-right">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">
                INR {getCurrentPrice()}
              </span>
              <span className="text-gray-600 ml-2">/night</span>
            </div>
            <p className="text-gray-500 text-sm">tax excluded</p>

            <button
              onClick={handleSelect}
              className="bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-8 rounded-full mt-4 w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loader">Loading...</span>
              ) : (
                "Select"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
