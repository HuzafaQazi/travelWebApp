
import React from "react";
import "tailwindcss/tailwind.css";

export default function CancellationPolicy() {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Cancellation Policy</h2>
            <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>For events, no cancellation, amendment, or postponement is permitted.</li>
                <li>Refunds, if applicable for valid cancellations made at least ten (10) days prior to the event, will be considered on a case-to-case basis. Approved refunds will be processed within fifteen (15) working days, after deducting 5% as payment gateway charges.</li>
            </ul>
        </div>
    );
}
