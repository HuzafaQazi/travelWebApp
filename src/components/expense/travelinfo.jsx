import TravelDetails from "./transportdetails";

export default function TravelInfoSection() {
  
  const cabInfo = [
    { label: "Pick-up Date", value: "Tue, Nov 25, 2025" },
    { label: "Drop Date", value: "Wed, Nov 26, 2025" },
    { label: "Car Type", value: "Sedan" },
    { label: "Pick-up Location", value: "Bangalore Airport" },
    { label: "Drop-off Location", value: "Electronic City" },
    { label: "Driver", value: "Yes" },
    { label: "Description", value: "Airport Transfer" },
  ];

  const trainInfo = [
    { label: "Departure Station", value: "Bangalore Central" },
    { label: "Arrival Station", value: "Chennai Egmore" },
    { label: "Date", value: "Tue, Nov 25, 2025" },
    { label: "Description", value: "Sleeper (Overnight)" },
  ];

  const busInfo = [
    { label: "Departure From", value: "Mysore" },
    { label: "Arrival At", value: "Coimbatore" },
    { label: "Date", value: "Tue, Nov 25, 2025" },
    { label: "Description", value: "AC Sleeper Bus" },
  ];

  return (
    <div className="space-y-5">
      <TravelDetails sectionTitle="Cab Details" data={cabInfo} />
      <TravelDetails sectionTitle="Train Details" data={trainInfo} />
      <TravelDetails sectionTitle="Bus Details" data={busInfo} />
    </div>
  );
}
