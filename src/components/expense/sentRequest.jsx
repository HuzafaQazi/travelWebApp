import HotelImage from "@/images/corporate/Hotel 1.png";
import FlightImage from "@/images/corporate/Flight Takeoff.png";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

const SentRequestModal = ({ isSentRequest, onClose, isFlight }) => {

    if (!isSentRequest) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[99999]">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black opacity-50"></div>

            {/* Popup box */}
            <div className="bg-[#155EEF] p-3 rounded-lg shadow-lg relative z-10 mx-2 sm:mx-auto">
                <div className="flex items-center justify-between">
                    <button
                        className="p-1 ml-auto  border-0 text-[#FFFFFF] float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                        onClick={onClose}
                    >
                        <FontAwesomeIcon icon={faXmarkCircle} />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center " >

                    <div className="w-32 h-32 bg-[#FFFFFF]  rounded-full overflow-hidden flex items-center justify-center">
                        <Image
                            src={isFlight ? FlightImage : HotelImage}
                            alt="room1"
                            className="rounded-lg w-[60px] h-20"
                        />
                    </div>
                    <div className="text-lg text-[#FFFFFF] py-2">Request Sent</div>
                    <div className="text-[#FFFFFF] text-sm  flex flex-col items-center justify-center py-2 ">
                        <div> Your travel request has been sent to the approver.</div>
                        <div> You will get notified via email once the action is taken on it.</div>
                    </div>

                    <button className="bg-white font-medium text-sm text-[#155EEF] w-full rounded-lg py-2 my-2">OKAY</button>
                </div>
            </div>
        </div>
    );
};

export default SentRequestModal;

