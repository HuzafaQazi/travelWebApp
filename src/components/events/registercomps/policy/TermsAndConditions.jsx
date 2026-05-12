
import React from "react";
import "tailwindcss/tailwind.css";

export default function GeneralBookingRules() {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Terms & Conditions (T&C)* </h2>
            <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>The attached booking voucher is valid for a single user, individual, or one family only.</li>
                <li>Bank convenience charges will be applicable for card users and will be deducted accordingly.</li>
                <li>
                    <span className="font-semibold">Room Sharing Policy:</span>In case a co-guest or friend is unable to attend the event or share the room for any reason, the remaining guest(s) will be liable to bear the additional charges, unless a replacement is arranged for room sharing.
                </li>
                <li>
                    <span className="font-semibold">Double Transactions Policy:</span> If any double or duplicate payment is made due to miscommunication and not brought to our notice at least ten (10) days before the event, the booking will be treated as non-cancellable and non-refundable.
                </li>
                <li>All guests are required to carry valid government-issued ID proof (Aadhaar card for Indian nationals).</li>
                <li>International guests must carry their passport and visa (a soft copy is acceptable)..</li>
                <li>Guests may be asked to present the booking confirmation voucher and valid ID proof at the time of check-in.</li>
                <li>Bookings that include a stay at Tamara are on a bed and breakfast basis. Any additional services not explicitly mentioned in the package will be chargeable as per the hotel’s policy.</li>
                <li>All rooms are strictly non-smoking. Smoking inside the room is strictly prohibited.</li>
                <li>The voucher is strictly non-transferable under any circumstances.</li>
                <li>Third and fourth occupants in a room will be provided with an extra mattress or bed, subject to availability.</li>
            </ul>
        </div>
    );
}
