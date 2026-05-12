import "tailwindcss/tailwind.css";
import { useRouter } from "next/router";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import corpLogo from "../../../images/corporate/corpbg.png";
import Image from "next/image";
import ActivateModal from "@/components/corporate/Activation/Activate";
import Head from "next/head";

export default function Activate() {
  const router = useRouter();
  const { id } = router.query;

  const hanleOnSignup = () => {
    router.push("/corporate/loginPage/Signup"); // Navigates to the login page
  };

  return (
    <>
      <Head>
        <title>Account Activation</title>
      </Head>
      <div className="bg-[#333] bg-gradie bg-custom-gradient">
        <div className="w-full h-screen flex flex-col sm:flex-row p-2 ">
          <div className="flex w-full sm:w-2/4">
            <div className="hidden sm:flex items-start">
              <Image
                //   onClick={redirectBooking}
                src={corpLogo}
                alt="Logo"
                width={180}
                className="cursor-pointer "
              />
            </div>
            <div className="flex flex-col justify-center  ">
              <span className="text-lg font-light text-[#D5b300] mb-3">
                QuGo.Corporate for Business Travel
              </span>
              <span className="text-xl sm:text-4xl font-extralight text-white mb-1 sm:mb-2">
                Easy . Quick . Managed
              </span>
              <span className="text-xl sm:text-4xl font-semibold  text-white ">
                Corporate Travel
              </span>
            </div>
            <div className="flex justify-between w-fit sm:w-[50%] px-[15%] pb-2 absolute bottom-0">
              {/* Email Section */}
              <div className="flex gap-1 items-center">
                <a
                  href="mailto:info@qugo.io"
                  className="flex gap-1 items-center"
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    color="#028fa3"
                    fontSize={10}
                    className="p-1 bg-white rounded-full"
                  />
                  <span className="text-white text-sm underline">
                    info@qugo.io
                  </span>
                </a>
              </div>

              {/* Phone Section */}
              <div className="flex gap-1 items-center">
                <a href="tel:+917411940701" className="flex gap-1 items-center">
                  <FontAwesomeIcon
                    icon={faPhone}
                    color="#028fa3"
                    fontSize={10}
                    className="p-1 bg-white rounded-full"
                  />
                  <span className="text-white text-sm underline">
                    +91 7411940701
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="w-fit sm:w-2/5 h-fit bg-white  rounded-lg p-2 mx-4 my-[6%] pb-5">
            {id && (
              <ActivateModal
                encodedData={id}
                // isOpen={true}
                // onClose={handleCloseActivateModal}
                onSignup={hanleOnSignup}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
