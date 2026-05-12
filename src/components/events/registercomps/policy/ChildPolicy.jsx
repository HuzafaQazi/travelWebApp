
import React from "react";
import "tailwindcss/tailwind.css";

export default function ChildPolicy() {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Child Policy</h2>
            <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>A maximum of One child below 12 years of age are allowed to stay in the same room with their parents.</li>
                <li>Extra bed or mattress will not be provided by default for children.</li>
                <li>If an extra bed or mattress is required, it will be provided only at an additional charge and is subject to availability.</li>
            </ul>
        </div>
    );
}
