import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import companyLogo from "@/images/corporate/countryimg.png";

const NoState = ({
  imageSrc,
  title,
  description,
  additionalInfo,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryAction,
  onSecondaryAction,
  formFields = [],
  formButtonText,
  onFormSubmit,
}) => {
  return (
    <div className="p-5 w-11/12 justify-center m-auto">
      <div className="flex justify-between gap-10">
        <div className="m-2 p-2">
          <Image src={companyLogo} alt="illustration" width={400} />
        </div>
        <div className="w-50 flex flex-col pt-4">
          <span>{title}</span>
          <div className="flex gap-2">
            <button
              className="bg-[#028fa3] text-white p-2 px-4 m-2 rounded text-sm flex items-center"
              onClick={onPrimaryAction}
            >
              <FontAwesomeIcon
                icon={faPlus}
                className="border-[1px] border-dotted rounded-full p-1 mr-2"
              />
              {primaryButtonText}
            </button>
            <button
              className="text-[#028fa3] border-[1px] border-solid border-[#028fa3] p-2 px-4 m-2 rounded text-sm flex items-center"
              onClick={onSecondaryAction}
            >
              <FontAwesomeIcon
                icon={faPlus}
                className="border-[1px] border-dotted border-[#028fa3] rounded-full p-1 mr-2"
              />
              {secondaryButtonText}
            </button>
          </div>
          <span className="font-normal text-[15px] block leading-tight my-2 pb-3 mb-3">
            {description}
          </span>
          <span className="font-normal text-[15px]">{additionalInfo}</span>
          {formFields.length > 0 && (
            <div className="flex mt-2 justify-between">
              {formFields.map((field, index) => (
                <div className="w-full ml-5" key={index}>
                  <div className="relative w-full min-w-[50px] h-10">
                    <input
                      type={field?.type || "text"}
                      id={field?.id}
                      name={field?.name}
                      className="block px-2.5 pb-2.5 pt-2.5 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-300 dark:focus:border-[#028fa3] focus:outline-none focus:ring-0 focus:border-[#028fa3]-600 peer"
                      placeholder=" "
                      value={field?.value}
                      onChange={field?.onChange}
                    />
                    <label
                      htmlFor={field?.id}
                      className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#028fa3] peer-focus:dark:text-[#028fa3] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
                    >
                      {field?.label}
                      {field?.required && (
                        <span className="text-red-500 absolute right-[-5px] m-1 mt-0">
                          *
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
          {formButtonText && (
            <div className="h-fit flex justify-center mt-3">
              <button
                className="text-[#028fa3] text-[15px] p-2 px-4 font-medium border-[1px] border-solid rounded-xl border-[#028fa3]"
                onClick={onFormSubmit}
              >
                {formButtonText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoState;
