import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "@/components/corporate/auth/Header";
import Navigation from "@/components/corporate/booking/Navigation";
import BookingRequest from "@/components/corporate/booking/hotels/landingPage/BookingRequest";
import BookingRequestSent from "@/components/corporate/booking/hotels/landingPage/BookingRequestSent";
import Counts from "@/components/corporate/booking/hotels/landingPage/Counts";
import TravelRequestByEmployees from "@/components/corporate/booking/hotels/landingPage/TravelRequestsByEmployees";
import Schedule from "@/components/corporate/booking/hotels/landingPage/Schedule";
import bg from "../../../../../public/img/corporate/CorNavBg.png";
import Footer from "@/components/corporate/footerCorporate/footerCorporate";
import ProtectedRoute from "@/components/corporate/protectedRoute/ProtectedRoute";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useRouter } from "next/router";
import { useGlobalEvent } from "@/hooks/useGlobalEvent";
import LogoCarousel from "@/components/PartnersCarousal/partnersCarousal";
import { setNeedsRefresh } from "@/store/slices/approvalSlice";
import { fetchApprovalsData } from "@/store/slices/approvalSlice";
import Head from "next/head";
import { getTabSpecificData } from "@/utils/axios/axios";
import { selectCorporateWalletBalance } from "@/store/selectors/corporateSelectors";

export default function Booking() {
  const router = useRouter();

  const dispatch = useDispatch();

  const walletBalance = useSelector(selectCorporateWalletBalance);

  const { userType, isApprover, isAdminApprover } = useUserPermissions();

  const needsRefresh = useSelector((state) => state.approvals.needsRefresh);

  const { dispatchEvent } = useGlobalEvent("LANDING_PAGE_VIEW_URL");

  useEffect(() => {
    if (needsRefresh) {
      const userId = getTabSpecificData("userID");
      // Fetch data for all relevant requestTypes
      const requestTypes = [
        {
          requestType: "1",
          approvalStatus: "",
        },
        {
          requestType: "2",
          approvalStatus: "",
        },
        {
          requestType: "3",
          approvalStatus: "",
        },
      ];
      requestTypes.forEach((param) => {
        dispatch(
          fetchApprovalsData({
            userId,
            requestType: param.requestType,
            approvalStatus: param.approvalStatus,
          })
        );
      });
      dispatch(setNeedsRefresh(false));
    }
  }, [needsRefresh, dispatch]);

  const handleRedirect = async (
    requestType = "1",
    url = "/corporate/auth/booking/approval"
  ) => {
    try {
      await router.push({
        pathname: url,
        query: { requestType },
      });
      // Delay to ensure Trips component is mounted
      // setTimeout(() => {
      //   const data = { requestType };
      //   dispatchEvent(data);
      // }, 100);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Bookings</title>
      </Head>
      <div className="bg-[#E5E9EB] h-full">
        {/* after auth header */}
        <div className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] bg-white">
          <Header />
        </div>

        {/* Navigation for Hotels, Flights, Packages */}
        <div
          className="hidden sm:block h-fit bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${bg.src})` }}
        >
          <div className="text-center pt-12">
            <div className="text-[#FFFFFF] text-xl font-bold">
              Your Complete Corporate Travel Partner
            </div>
            <div className="text-[#FFFFFF] text-base font-normal">
              Simplify corporate travel experiences for travelers and travel
              managers{" "}
            </div>
          </div>
          <div className="mt-2 px-5 py-10 w-full ">
            <Navigation />
          </div>
        </div>

        {/* navigation for mobile */}
        <div className="sm:hidden">
          <Navigation />
        </div>

        {/* admin content */}
        <div className="bg-white pt-5 pb-3 px-4 gap-3 2xl:mx-[12%]">
          <div className="text-[#1C1C1C] text-lg font-semibold text-left">
            Our Esteemed Customers
          </div>

          <LogoCarousel />

          <Counts handleRedirect={handleRedirect} />

          {userType === 2 && !isApprover && (
            <BookingRequestSent
              handleRedirect={handleRedirect}
              fetchApprovalsData={fetchApprovalsData}
            />
          )}
          {userType === 2 && isApprover && (
            <>
              <BookingRequestSent
                handleRedirect={handleRedirect}
                fetchApprovalsData={fetchApprovalsData}
              />
              <TravelRequestByEmployees
                fetchApprovalsData={fetchApprovalsData}
                handleRedirect={handleRedirect}
              />
            </>
          )}
          {userType === 1 && (
            <>
              <BookingRequest
                handleRedirect={handleRedirect}
                fetchApprovalsData={fetchApprovalsData}
                walletBalance={walletBalance}
              />
              <BookingRequestSent
                handleRedirect={handleRedirect}
                fetchApprovalsData={fetchApprovalsData}
              />
              {isAdminApprover && (
                <TravelRequestByEmployees
                  fetchApprovalsData={fetchApprovalsData}
                  handleRedirect={handleRedirect}
                />
              )}
            </>
          )}
          {/* <OfferAndRequest /> */}
          {/* <CorporatePackages /> */}
          <Schedule />
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
