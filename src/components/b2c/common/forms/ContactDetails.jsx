const ContactDetails = ({ email, mobile }) => {
  return (
    <div className="flex sm:flex-row flex-col items-center gap-4 justify-between">
      <div className="w-1/2 self-start">
        <div className="text-[#171A19] font-semibold text-lg">
          Contact details
        </div>
        <div className="text-[#171A19] font-normal text-sm">
          Your ticket will be sent to this email address
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <div className="relative w-full min-w-[50px] h-10">
            <input
              className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#028FA330] border-1 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 border-2 peer"
              placeholder=" "
              id="email"
              type="text"
              value={email}
              readOnly
            />
            <label
              htmlFor="email"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              Email Id
            </label>
          </div>
        </div>

        <div className="w-full flex gap-2 sm:w-1/2">
          <div className="w-1/4">
            <input
              id="country-code"
              type="text"
              placeholder="+91"
              defaultValue={"+91"}
              className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#028FA330] border-1 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 border-2 peer"
              readOnly
            />
          </div>
          <div className="w-full">
            <div className="relative w-full min-w-[50px] h-10">
              <input
                className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-[#028FA330] border-1 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 border-2 peer"
                placeholder=" "
                id="number"
                type="text"
                value={mobile}
                readOnly
              />
              <label
                htmlFor="number"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
              >
                Mobile Number
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
