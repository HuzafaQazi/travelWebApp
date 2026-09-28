export default function TravelerTabs({
  travelers,
  travelerIndex,
  setTravelerIndex,
  info,
}) {
  return (
    <div className="flex overflow-x-scroll gap-3 mt-3">
      {travelers &&
        travelers.map((traveler, index) => (
          <div
            key={index}
            className={`flex rounded-md min-w-36 flex-col gap-2 items-center p-2 ${
              travelerIndex === index
                ? "text-[#155EEF] border border-[#155EEF2B]"
                : " border-[1px] border-[#0000000F] bg-custom-shadow1"
            }`}
            onClick={() => setTravelerIndex(index)}
          >
            <div className="text-sm">
              {traveler?.firstName} {traveler?.lastName}
            </div>
            <div className="bg-[#155EEF0F] text-sm rounded-full p-1 px-3">
              {info}
            </div>
          </div>
        ))}
    </div>
  );
}
