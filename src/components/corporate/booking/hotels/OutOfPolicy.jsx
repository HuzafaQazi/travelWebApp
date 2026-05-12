import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed } from "@fortawesome/free-solid-svg-icons";

const PolicyPopup = ({ onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" ></div>
            <div className=" relative bg-white p-4 rounded-lg shadow-lg z-10 w-112 max-w-lg">
                <h2 className="text-lg text-[#030F0C] font-semibold mb-4">Why is this option out of policy?</h2>
                <div className="flex items-center mb-2 text-red-600">
                    <FontAwesomeIcon icon={faBed} className="mr-2"/>
                    <div className="flex flex-col">
                        <span className="text-sm">Hotels should be booked 20 days in advance</span>
                        <span className="text-sm">You cannot choose hotels with <span className="font-bold">Refundable</span>  service.</span>
                        <span className="text-sm">You cannot choose hotels with <span className="font-bold">Breakfast</span>  service. </span>
                        <span className="text-sm text-gray-500">According to your travel policy!</span>
                    </div>
                </div>
                <div className="text-gray-500 text-sm border-t py-2">The full travel policy is available <a href="#" className="text-blue-500">here</a>.</div>
            </div>
        </div>
    );
}
export default PolicyPopup;