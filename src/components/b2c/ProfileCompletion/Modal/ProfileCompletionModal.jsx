import React, { useState } from "react";
import { useSelector } from "react-redux";
import { selectIsProfileIncomplete } from "@/store/selectors/b2cSelectors";
import ProfileDetailsForm from "@/components/b2c/common/ProfileSheet/ProfileDetailsForm";
import CompanyDetailsForm from "@/components/b2c/common/ProfileSheet/CompanyDetailsForm";

const ProfileCompletionModal = ({ show, userId }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const isIncomplete = useSelector(selectIsProfileIncomplete);

  // Don't render if profile is complete
  if (!isIncomplete || !show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999999999] flex items-center justify-center p-4">
      {/* Backdrop - cannot click through */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 shrink-0">
          <h2 className="text-3xl font-bold text-white">
            Complete Your Profile
          </h2>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Warning Banner */}
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="text-amber-800 font-semibold text-base mb-1">
                  Please complete your profile to continue using WeynGo Travel
                </p>
                <p className="text-amber-700 text-sm">
                  We need your basic information to provide you with the best
                  travel experience.
                </p>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              👤
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "profile"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab("company")}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "company"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Company Details{" "}
                <span className="text-xs text-gray-400">(Optional)</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "profile" && (
              <ProfileDetailsForm userID={userId} isCompletionMode={true} />
            )}
            {activeTab === "company" && <CompanyDetailsForm userID={userId} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
