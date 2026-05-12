import Image from "next/image";
import { useState, useEffect } from "react";
import corpLogo from "../../../../images/corporate/corplogo copy.png";
import { faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import config from "@/config";
import axios from "@/utils/axios/axios";
import { ErrorMessage } from "@/components/corporate/errorStatus/StatusComponents";
export default function RequestUpdate() {
  const router = useRouter();
  const { bookingId, companyId, approverId, status } = router.query;
  const [approverStatus, setApproverStatus] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    if (router.isReady) {
      // console.log(bookingId, companyId, approverId, status);
      getApproverStatus();
    }
  }, [bookingId, companyId, approverId, status]);

  const getApproverStatus = async () => {
    try {
      const response = await axios.get(
        `${config.CORPORATE.GET_APPROVER_ACTION}?bookingId=${bookingId}&companyId=${companyId}&approverId=${approverId}&status=${status}`
      );
      const data = await response.data;
      setApproverStatus(data.status);
    } catch (error) {
      setApproverStatus("FAILED");
      setErrorMessage(error.response.data.message);
      console.error("Error fetching data:", error.response.data.status);
    }
  };
  const redirectBooking = async () => {
    await router.push("/corporate");
};

  return (
    <>
      <div className="h-screen overflow-hidden">
        <div>
          <Image
           onClick={redirectBooking}
            src={corpLogo}
            className="w-[45%] md:w-[24%] h-auto cursor-pointer"
            alt="Logo"
          />
        </div>
        {!approverStatus ? (
          <>
            <div className="w-full h-full flex items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} spin color="#028fa3" size="2xl"/>
            </div>
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            {approverStatus === "SUCCESS" ? (
              <div className="bg-white px-2 py-5 rounded-md m-2">
                <div>Booking Request Status is updated</div>
                <div className="flex items-center justify-center mt-2">
                  <div className="text-white bg-green-600 w-10 h-10 rounded-full text-center text-3xl">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full m-2">
                <ErrorMessage message={errorMessage} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
