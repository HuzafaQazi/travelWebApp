import { useState } from "react";
import 'tailwindcss/tailwind.css';
import Header from "@/components/corporate/auth/Header";
import MultiInput from "@/components/corporate/common/multiInput/MultiInput";
import Footer1 from "@/components/corporate/footerCorporate/footerCorporate";

export default function Configuration() {
    const [activeTab, setActiveTab] = useState(0);
    const MAX_TAGS = 5;
    const [tags, setTags] = useState([]);

    const handleTabClick = (index) => {
        setActiveTab(index);
        const section = document.getElementById(`section-${index}`);
        section.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAddTag = (tag) => {
        setTags((prevTags) => [...prevTags, tag]);
    };

    const handleDeleteTag = (index) => {
        setTags((prevTags) => prevTags.filter((_, i) => i !== index));
    };

    return (
        <>
            <div className="bg-[#E5E9EB] h-full">
                <div class="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] bg-white">
                    <Header />
                </div>

                <div className="p-10 px-20 flex flex-col">
                    <span className="text-3xl font-semibold">
                        Configuration
                    </span>
                    <span className="text-[#171A19] text-sm">
                        Tailor the application to your needs
                    </span>

                    {/* tabs to navigate different section of configuration */}
                    <div className="bg-white px-32 p-3 mt-3 rounded-lg">
                        <div className="flex gap-3 w-fit m-auto">
                            <div
                                className={`${activeTab === 0 ? 'bg-gray-200' : ''
                                    } p-2 rounded-full cursor-pointer text-sm`}
                                onClick={() => handleTabClick(0)}
                            >
                                Booking
                            </div>
                            <div
                                className={`${activeTab === 1 ? 'bg-gray-200' : ''
                                    } p-2 rounded-full cursor-pointer text-sm`}
                                onClick={() => handleTabClick(1)}
                            >
                                Company
                            </div>
                            <div
                                className={`${activeTab === 2 ? 'bg-gray-200' : ''
                                    } p-2 rounded-full cursor-pointer text-sm`}
                                onClick={() => handleTabClick(2)}
                            >
                                Approvals
                            </div>
                            <div
                                className={`${activeTab === 3 ? 'bg-gray-200' : ''
                                    } p-2 rounded-full cursor-pointer text-sm`}
                                onClick={() => handleTabClick(3)}
                            >
                                Travel Management
                            </div>
                            <div
                                className={`${activeTab === 4 ? 'bg-gray-200' : ''
                                    } p-2 rounded-full cursor-pointer text-sm`}
                                onClick={() => handleTabClick(4)}
                            >
                                Wallet
                            </div>
                            <div
                                className={`${activeTab === 5 ? 'bg-gray-200' : ''
                                    } p-2 rounded-full cursor-pointer text-sm`}
                                onClick={() => handleTabClick(5)}
                            >
                                Dashboard
                            </div>
                            <div
                                className={`${activeTab === 6 ? 'bg-gray-200' : ''
                                    } p-2 rounded-full cursor-pointer text-sm`}
                                onClick={() => handleTabClick(6)}
                            >
                                Notifications
                            </div>
                        </div>
                    </div>
                    <div className="bg-white flex mt-2 rounded-lg" id="section-0">
                        <div className="w-1/3 flex p-10 px-10 flex-col">
                            <span className="text-xl font-semibold text-[#028fa3]">Manage Bookings</span>
                            <div className="text-sm mt-2">
                                Access of the booking to the various users based on their jobs,
                                such as <span className="font-semibold">administrators, managers, and employees</span>
                            </div>
                        </div>
                        <div className="w-2/3 p-10 px-10">
                            <div className="flex items-center justify-between">
                                <span>
                                    Allow Employees for Self Booking
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Bookings can be done by employees NOT added in the group
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Employees can only do in-policy bookings
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col mt-2">
                                <span>
                                    Specific employee don’t require approval for Booking
                                </span>
                                <div className="mt-2">
                                    <span className="text-xs">Work Email</span>
                                    <div className="border border-gray-300 p-2 rounded-lg">
                                        <MultiInput
                                            onAddTag={handleAddTag}
                                            onDeleteTag={handleDeleteTag}
                                            tags={tags}
                                            maxTags={MAX_TAGS}
                                            placeholder={"Add Work Email"}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Allow Employees to book for colleagues
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white flex mt-2 rounded-lg" id="section-1">
                        <div className="w-1/3 flex p-10 px-10 flex-col">
                            <span className="text-xl font-semibold text-[#028fa3]">Manage Approvals</span>
                            <div className="text-sm mt-2">
                                Providing access to groups and subgroups of employees within the organizational hierarchy.
                            </div>
                        </div>
                        <div className="w-2/3 p-10 px-10">
                            <div className="flex items-center justify-between">
                                <span>
                                    Allow Employees for Self Booking
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Bookings can be done by employees NOT added in the group
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Employees can only do in-policy bookings
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col mt-2">
                                <span>
                                    Specific employee don’t require approval for Booking
                                </span>
                                <div className="mt-2">
                                    <span className="text-xs">Work Email</span>
                                    <div className="border border-gray-300 p-2 rounded-lg">
                                        <MultiInput
                                            onAddTag={handleAddTag}
                                            onDeleteTag={handleDeleteTag}
                                            tags={tags}
                                            maxTags={MAX_TAGS}
                                            placeholder={"Add Work Email"}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Allow Employees to book for colleagues
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white flex mt-2 rounded-lg" id="section-2">
                        <div className="w-1/3 flex p-10 px-10 flex-col">
                            <span className="text-xl font-semibold text-[#028fa3]">Manage Company & Employees</span>
                            <div className="text-sm mt-2">
                                Providing access to employees within the organizational hierarchy.
                            </div>
                        </div>
                        <div className="w-2/3 p-10 px-10">
                            <div className="flex items-center justify-between">
                                <span>
                                    Allow Employees for Self Booking
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Bookings can be done by employees NOT added in the group
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Employees can only do in-policy bookings
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col mt-2">
                                <span>
                                    Specific employee don’t require approval for Booking
                                </span>
                                <div className="mt-2">
                                    <span className="text-xs">Work Email</span>
                                    <div className="border border-gray-300 p-2 rounded-lg">
                                        <MultiInput
                                            onAddTag={handleAddTag}
                                            onDeleteTag={handleDeleteTag}
                                            tags={tags}
                                            maxTags={MAX_TAGS}
                                            placeholder="Add Work Email"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Allow Employees to book for colleagues
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white flex mt-2 rounded-lg" id="section-3">
                        <div className="w-1/3 flex p-10 px-10 flex-col">
                            <span className="text-xl font-semibold text-[#028fa3]">Manage Wallet</span>
                            <div className="text-sm mt-2">
                                Allow users to store and manage their funds within the platform through wallet
                            </div>
                        </div>
                        <div className="w-2/3 p-10 px-10">
                            <div className="flex items-center justify-between">
                                <span>
                                    Allow Employees for Self Booking
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Bookings can be done by employees NOT added in the group
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Employees can only do in-policy bookings
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col mt-2">
                                <span>
                                    Specific employee don’t require approval for Booking
                                </span>
                                <div className="mt-2">
                                    <span className="text-xs">Work Email</span>
                                    <div className="border border-gray-300 p-2 rounded-lg">
                                        <MultiInput
                                            onAddTag={handleAddTag}
                                            onDeleteTag={handleDeleteTag}
                                            tags={tags}
                                            maxTags={MAX_TAGS}
                                            placeholder={"Add Work Email"}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span>
                                    Allow Employees to book for colleagues
                                </span>
                                <div>
                                    <label class="inline-flex items-center me-5 cursor-pointer">
                                        <input type="checkbox" value="" class="sr-only peer" />
                                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#028fa3]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <Footer1 />
                </div>
            </div>
        </>
    )
};