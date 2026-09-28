import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import nodata from "@/images/corporate/booking requests 2.png";
import RequestCard from "@/components/corporate/booking/hotels/landingPage/RequestCard";
import { fetchApprovalsData } from "@/store/slices/approvalSlice";
import RequestCardSkeleton from "@/components/corporate/Loaders/Homepage/RequestCardSkeleton";
import { getTabSpecificData } from "@/utils/axios/axios";

const TravelRequestByEmployees = ({ handleRedirect }) => {
  const dispatch = useDispatch();
  const isInitialRender = useRef(true);

  const requestType = "3";

  const data = useSelector(
    (state) => state?.approvals?.approvalsData?.[requestType]
  );

  const loading = useSelector((state) => state?.approvals?.loading);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      const userId = getTabSpecificData("userID")?.replace(/"/g, "");
      dispatch(fetchApprovalsData({ userId, requestType }));
    }
  }, [dispatch]);

  const count = data?.data?.count;

  return (
    <div className="mt-3">
      {data?.data?.response?.length > 0 && (
        <div className="flex gap-3 ">
          <div className="text-[#1C1C1C] text-lg font-semibold">
            For you to Approve ({count})
          </div>
          <div
            onClick={() => handleRedirect(3)}
            className="text-[#155EEF] text-lg font-medium cursor-pointer"
          >
            View All{" "}
            <span>
              <FontAwesomeIcon icon={faChevronRight} className="h-4" />{" "}
            </span>
          </div>
        </div>
      )}

      <div className="bg-[#E5E9EB] w-full h-full rounded-lg p-3 mt-2 overflow-x-auto hide-scrollbar">
        {loading ? (
          <RequestCardSkeleton count={3} type="approval" />
        ) : (
          <>
            {data?.data?.response?.length > 0 ? (
              <div className="flex gap-3 ">
                {data?.data?.response?.map((request, index) => (
                  <RequestCard
                    key={index}
                    data={request}
                    showApprovalButtons={true}
                  // onActionComplete={fetchData}
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 justify-center items-center ">
                <div className="w-[30%] items-center justify-center sm:pl-8">
                  <div className="text-[#171A19] font-medium text-base sm:text-3xl">
                    Receive all employee <br /> requests!
                  </div>
                  <div className="text-[#171A19] font-normal text-sm sm:text-base">
                    No requests for now!
                  </div>
                </div>

                <Image src={nodata} alt="hotelimage" className="w-[60%] sm:w-[70%]  -m-4" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TravelRequestByEmployees;
