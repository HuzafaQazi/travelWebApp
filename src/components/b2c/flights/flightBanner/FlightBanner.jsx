import { useLogin } from "@/store/context/LoginContext";
import FlightNavigation from "../flightNavigation/FlightNavigation";

export default function Banner({
  setPageLoading,
  selectedTravelers,
  setSelectedTravelers,
  handleTravelerChange,
  isDropdownVisible,
  setIsDropdownVisible,
}) {
  const { isLoggedIn } = useLogin();

  return (
    <>
      <div>
        <FlightNavigation
          isDropdownVisible={true}
          // setPageLoading={setPageLoading}
          // selectedTravelers={selectedTravelers}
          // setSelectedTravelers={setSelectedTravelers}
          // handleTravelerChange={handleTravelerChange}
          // isDropdownVisible={isDropdownVisible}
          // setIsDropdownVisible={setIsDropdownVisible}
        />
      </div>
    </>
  );
}
