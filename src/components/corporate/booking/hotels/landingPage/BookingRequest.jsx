import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import nodata from "@/images/corporate/booking requests 3.png";
import RequestCard from "@/components/corporate/booking/hotels/landingPage/RequestCard";
import { fetchApprovalsData } from "@/store/slices/approvalSlice";
import RequestCardSkeleton from "@/components/corporate/Loaders/Homepage/RequestCardSkeleton";
import { getTabSpecificData } from "@/utils/axios/axios";

const BookingRequests = ({ handleRedirect, walletBalance }) => {
  const dispatch = useDispatch();
  const isInitialRender = useRef(true);

  const requestType = "1";
  const approvalStatus = "";

  const data = useSelector(
    (state) => state?.approvals?.approvalsData?.[requestType]
  );

  const loading = useSelector((state) => state?.approvals?.loading);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      const userId = getTabSpecificData("userID")?.replace(/"/g, "");
      dispatch(fetchApprovalsData({ userId, requestType, approvalStatus }));
    }
  }, [dispatch]);

  const count = data?.data?.count;

  return (
    <>
      {data?.data?.response?.length > 0 && (
        <div className="flex gap-3">
          <div className="text-[#1C1C1C] text-lg font-semibold">
            Requests sent by All ({count})
          </div>
          <div
            className="text-[#028FA3] text-lg font-medium cursor-pointer"
            onClick={() => handleRedirect(1)}
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
          <RequestCardSkeleton count={3} type="proceed" />
        ) : (
          <>
            {data?.data?.response?.length > 0 ? (
              <div className="flex gap-3 ">
                {data?.data?.response?.map((request, index) => (
                  <RequestCard
                    key={index}
                    data={request}
                    showProceedButton={true}
                    walletBalance={walletBalance}
                    // onActionComplete={fetchData}
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 justify-center items-center ">
                <div className="w-[30%] items-center justify-center sm:pl-4">
                  <div className="text-[#171A19] font-medium text-base sm:text-3xl">
                    Get Status of all Booking <br /> requests sent by you!
                  </div>
                  <div className="text-[#171A19] font-normal text-sm sm:text-base">
                    No requests for now!
                  </div>
                </div>

                <Image src={nodata} alt="hotelimage" className="w-[60%] sm:w-[70%] -m-4" />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default BookingRequests;
