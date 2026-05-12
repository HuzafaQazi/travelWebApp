const CompanyDetails = ({ userDetails }) => {
  const customComponents = {
    IndicatorSeparator: () => null,
    DropdownIndicator: () => null,
  };

  return (
    <>
      <div>
        <div className="text-[#030F0C] font-semibold text-lg border-b p-2 border-[#030B091A]">
          Company Details{" "}
        </div>

        <div className="flex space-x-4 mt-3">
          <div className="w-full">
            <label
              htmlFor="company-name"
              className="block text-xs mb-1 text-[#878786]"
            >
              Company name
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <input
              id="company-name"
              value={userDetails?.companyDetails?.companyName}
              name="companyName"
              type="text"
              placeholder="Company Name"
              className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
              readOnly
            />
            <div className="text-red-500 text-xs mt-1"></div>
            <div className="text-[#878786] text-xxs font-normal">
              This is the legal name of the organization
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <div className="flex justify-between gap-2">
            <div className="w-1/2">
              <label
                htmlFor="gst"
                className="block text-xs mb-1 text-[#878786]"
              >
                GST
                <span className="text-red-500 m-1 mt-0">*</span>
              </label>
              <input
                id="gst"
                name="gst"
                value={userDetails?.companyDetails?.gst}
                type="email"
                placeholder="GST"
                className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
                readOnly
              />
              <div className="text-red-500 text-xs mt-1"></div>
            </div>
            <div className="w-1/2">
              <label
                htmlFor="email"
                className="block text-xs mb-1 text-[#878786]"
              >
                GST Email
                <span className="text-red-500 m-1 mt-0">*</span>
              </label>
              <input
                id="email"
                name="workEmail"
                value={userDetails?.companyDetails?.gstEmail}
                type="email"
                placeholder="Email"
                className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
                readOnly
              />
              <div className="text-red-500 text-xs mt-1"></div>
            </div>
          </div>
          <div className="w-1/2">
            <label
              htmlFor="mobile-number"
              className="block text-xs mb-1 text-[#878786]"
            >
              GST Mobile Number
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                id="country-code"
                type="text"
                placeholder="+91"
                defaultValue={"+91"}
                className="w-1/4 p-2 text-xs sm:text-base border-none bg-[#87878614] text-[#878786] rounded"
                readOnly
              />
              <input
                id="mobile-number"
                type="text"
                value={userDetails?.companyDetails?.gstMobileNumber}
                name="mobileNumber"
                placeholder="Mobile Number"
                className="w-3/4 p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
                readOnly
              />
            </div>

            <div className="text-red-500 text-xs mt-1"></div>
          </div>
        </div>

        <div className="flex space-x-4 mt-3">
          <div className="w-full">
            <label
              htmlFor="address"
              className="block text-xs mb-1 text-[#878786]"
            >
              Address
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <input
              id="address"
              value={userDetails?.companyDetails?.address}
              name="address"
              type="text"
              placeholder="address"
              className="w-full p-2 text-xs sm:text-base  border-none bg-[#87878614] rounded"
              readOnly
            />
            <div className="text-red-500 text-xs mt-1"></div>
          </div>
        </div>

        <div className="flex space-x-4 mt-3">
          <div className="w-2/4">
            <label htmlFor="city" className="block text-xs mb-1 text-[#878786]">
              City
            </label>
            <input
              id="city"
              value={userDetails?.companyDetails?.cityName}
              name="city"
              type="text"
              placeholder="city"
              className="w-full p-2 text-xs sm:text-base  border-none bg-[#87878614] rounded"
              readOnly
            />
            <div className="text-red-500 text-xs mt-1"></div>
          </div>
          <div className="w-2/4">
            <label
              htmlFor="country"
              className="block mb-1 text-xs text-[#878786]"
            >
              Country
            </label>
            <input
              id="country"
              value={userDetails?.companyDetails?.countryName}
              name="country"
              type="text"
              placeholder="country"
              className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
              readOnly
            />
            <div className="text-red-500 text-xs mt-1"></div>
          </div>
        </div>

        <div className="flex space-x-8 mt-3">
          <div className="w-2/4">
            <label htmlFor="pan" className="block text-xs mb-1 text-[#878786]">
              Pan
              <span className="text-red-500 m-1 mt-0">*</span>
            </label>
            <div className="flex space-x-2">
              <input
                id="pan"
                type="text"
                value={userDetails?.companyDetails?.pan}
                name="pan"
                placeholder="Pan"
                className="w-full p-2 text-xs sm:text-base border-none bg-[#87878614] rounded"
                readOnly
              />
            </div>

            <div className="text-red-500 text-xs mt-1"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyDetails;
