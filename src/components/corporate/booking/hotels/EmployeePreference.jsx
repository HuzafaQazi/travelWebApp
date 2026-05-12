import { useState, useRef } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { createPortal } from "react-dom";

const EmployeePreferenceSideSheet = ({ isOpen, onClose }) => {

    const [selectedTab, setSelectedTab] = useState('Flight');
    const [showPreferences, setShowPreferences] = useState(false);
    const flightRef = useRef(null);
    const hotelRef = useRef(null);
    const handlePencilClick = () => {
        setShowPreferences(!showPreferences);
    };

    const handleTabClick = (tab) => {
        setSelectedTab(tab);

        // Scroll to the respective section
        if (tab === 'Flight') {
            flightRef.current.scrollIntoView({ behavior: 'smooth' });
        } else if (tab === 'Hotel') {
            hotelRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return createPortal(
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                ></div>
            )}

            {/* Side Sheet */}
            <div
                className={`fixed top-0 right-0 h-full w-[50%] bg-white z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'transform translate-x-0' : 'transform translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between px-4 py-2">
                    <div className=" flex text-base text-[#171A19] font-semibold items-center">Preferences <FontAwesomeIcon icon={faPencil} onClick={handlePencilClick} className='text-[#FFFFFF] text-xxs bg-[#028FA3] rounded-full p-1 ml-1' /></div>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
                        <FontAwesomeIcon icon={faCircleXmark} className='text-[#878786]' />
                    </button>
                </div>
                {/* Content Area */}
                {showPreferences ? (
                    <div className="px-4 py-2 h-[calc(100vh-50px)] overflow-y-scroll scrollbar-thin scrollbar-thumb-rounded">
                        <div className="flex gap-20 border-b border-gray-300 mt-3">
                            {['Flight', 'Hotel'].map((tab) => (
                                <div
                                    key={tab}
                                    onClick={() => handleTabClick(tab)}
                                    className={`pb-2 cursor-pointer ${selectedTab === tab
                                        ? 'border-b-2 border-[#028FA3] text-[#028FA3] font-semibold'
                                        : 'border-b-2 border-transparent text-black hover:border-[#028FA3] hover:text-[#028FA3]'
                                        }`}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        <div ref={flightRef} className='mt-4' >
                            <div className='text-[#028FA3] text-base font-medium mt-2'>Flight</div>

                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Seat</div>
                                <div className="grid grid-cols-3 my-2">
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Window Seat</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Aisle Seat</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Middle Seat</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Free Seat</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Chargeable Seat</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Meal</div>
                                <div className="grid grid-cols-3 my-2">
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Veg</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Non - Veg</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Sorting Options</div>
                                <div className="grid grid-cols-3 my-2">
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Cheapest flight</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Day Travel time</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Evening Travel time</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Night Travel time</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Airline</div>
                                <div className="grid grid-cols-4 my-2">
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Indigo</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Vistara</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">AirIndia</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">SpiceJet</label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Class Type</div>
                                <div className="grid grid-cols-4 my-2">
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Economy</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Business</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Premium</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Preimum econonmy</label>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div ref={hotelRef} className='mt-4'>
                            <div className='text-[#028FA3] text-base font-medium'>Hotel</div>

                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Hotel</div>
                                <div className="grid grid-cols-4 my-2">
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">3 Star</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">4 Star</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">5 Star</label>
                                    </div>
                                    <div className="flex w-fit items-center bg-[#8787860F] p-2 rounded-full my-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer appearance-none h-3 w-3 border border-gray-300 rounded-full checked:bg-gray-700 checked:border-blue-600 focus:outline-none checked:focus:bg-gray-700"
                                        />

                                        <label className="ml-2 text-[#4A4A4A] text-sm font-normal">Cheapest hotel</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-4 py-2 h-[calc(100vh-50px)] overflow-y-scroll scrollbar-thin scrollbar-thumb-rounded">
                        <div className="flex gap-20 border-b border-gray-300 mt-3">
                            {['Flight', 'Hotel'].map((tab) => (
                                <div
                                    key={tab}
                                    onClick={() => handleTabClick(tab)}
                                    className={`pb-2 cursor-pointer ${selectedTab === tab
                                        ? 'border-b-2 border-[#028FA3] text-[#028FA3] font-semibold'
                                        : 'border-b-2 border-transparent text-black hover:border-[#028FA3] hover:text-[#028FA3]'
                                        }`}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>
                        <div ref={flightRef} className='mt-4'>
                            <div className='text-[#028FA3] text-base font-medium mt-2'>Flight</div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Seat</div>
                                <div className="grid grid-cols-4 my-2">
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Window Seat
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Free Seat
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Meal</div>
                                <div className="grid grid-cols-4 my-2">
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Veg
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Non Veg
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Sorting Options</div>
                                <div className="grid grid-cols-4 my-2">
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Evening Travel time
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Day Travel time
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Airline</div>
                                <div className="grid grid-cols-5 my-2">
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Indigo
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Vistara
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        AirIndia
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        SpiceJet
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        GoFirst
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Row</div>
                                <div className="grid grid-cols-4 my-2">
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        5-10
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        10-15
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div ref={hotelRef} className='mt-4' >
                            <div className='text-[#028FA3] text-base font-medium'>Hotel</div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Room type</div>
                                <div className="grid grid-cols-4 my-2">
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Single room
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Double room
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='text-[#171A19] text-sm font-semibold mt-2'>Preferred Room facilities</div>
                                <div className="grid grid-cols-4 my-2">
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Breakfast included
                                    </div>
                                    <div className='text-[#028FA3] bg-[#028FA312] text-sm font-medium w-fit p-2 rounded-full my-1'>
                                        Lunch included
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>,
        document.body
    );
};
export default EmployeePreferenceSideSheet;



