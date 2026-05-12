import Header from "@/components/corporate/auth/Header";
import Navigation from "@/components/corporate/booking/Navigation";
import BookingRequest from "@/components/corporate/booking/hotels/landingPage/BookingRequest";
import BookingRequestSent from "@/components/corporate/booking/hotels/landingPage/BookingRequestSent";
import TravelRequestByEmployees from "@/components/corporate/booking/hotels/landingPage/TravelRequestsByEmployees";
import OfferAndRequest from "@/components/corporate/booking/hotels/landingPage/OffersAndUpdates";
import Schedule from "@/components/corporate/booking/hotels/landingPage/Schedule";
import CorporatePackages from "@/components/corporate/booking/hotels/landingPage/CorporatePackages";
import Footer from "@/components/corporate/footerCorporate/footerCorporate";

export default function Booking() {
  return (
    <>
      <div className="bg-[#E5E9EB] h-full">
        {/* after auth header */}
        <div className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] bg-white">
          <Header />
        </div>
        <div className="h-fit bg-cover bg-no-repeat bg-[url('/src/images/corporate/Group 14479.png')]">
          <div class="px-5 py-20">
            <Navigation />
          </div>
        </div>

        {/* admin content */}
        <div className="bg-white pt-5 pb-3 px-4 gap-3">
          <BookingRequest />
          <BookingRequestSent />
          <TravelRequestByEmployees />
          <OfferAndRequest />
          <CorporatePackages />
          <Schedule />
        </div>
        <Footer />
      </div>
    </>
  );
}
