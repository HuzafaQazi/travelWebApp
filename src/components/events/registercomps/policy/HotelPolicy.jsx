
import React from "react";
import "tailwindcss/tailwind.css";

export default function HotelPolicy() {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Hotel Policy</h2>
            <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Usage of the swimming pool is complimentary. Guests are required to carry a nylon swimsuit along with a sunscreen and lotion kit.</li>
                <li>Breakfast will be served at O Café between 07:00 AM and 10:00 AM.</li>
                <li>Meals included in the package must be availed only at the designated dining areas and are not available through room service.</li>
                <li>Guests are expected to ensure that no damage is caused to hotel property or belongings. Any damage will be chargeable and must be borne by the guest.</li>
                <li>Bringing or consuming outside food or liquor within the hotel premises is strictly prohibited.</li>
                <li>Pets are not allowed in the hotel under any circumstances.</li>
                <li>Storing of raw/exposed film reels, hazardous materials, combustible items, or any other prohibited goods is strictly forbidden. The guest will be held solely responsible for any financial loss or damage resulting from negligence or violation of these rules.</li>
                <li>Images used on websites or in promotional materials are for representational purposes only and may not reflect the actual activity, room type, or experience.</li>
                <li>Hotel management reserves the right to amend, update, or change any of the above terms and policies at any time without prior notice.</li>
            </ul>
        </div>
    );
}
