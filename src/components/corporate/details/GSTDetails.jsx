const GSTDetails = ({
  companyName,
  gstNumber,
  companyEmail,
  companyMobile,
  companyAddress,
}) => {
  return (
    <>
      <div className="text-lg text-[#171A19] font-semibold">GST Details</div>
      <div className="text-xs font-medium mb-2">
        These GST Details will be sent together with your booking. To update any
        GSTN details, check with admin.
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex">
          <div className="w-2/4">
            <div className="text-xs sm:text-sm font-medium leading-[15px]">
              Company name
            </div>
            <div className="text-xxs">{companyName}</div>
          </div>
          <div className="w-2/4">
            <div className="text-xs sm:text-sm font-medium leading-[15px]">
              GST Number
            </div>
            <div className="text-xxs">{gstNumber}</div>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <div className="text-xs sm:text-sm font-medium leading-[15px]">
              GST Email
            </div>
            <div className="text-xxs">{companyEmail}</div>
          </div>
          <div className="w-2/4">
            <div className="text-xs sm:text-sm font-medium leading-[15px]">
              GST Mobile Number
            </div>
            <div className="text-xxs">{companyMobile}</div>
          </div>
        </div>
      </div>
      <div>
        <div className="text-xs sm:text-sm font-medium leading-[15px] mt-2">
          GST Address
        </div>
        <div className="text-xxs sm:text-sm font-medium leading-[15px]">
          {companyAddress}
        </div>
      </div>
    </>
  );
};

export default GSTDetails;
