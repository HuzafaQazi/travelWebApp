import { useState } from "react";
import Header from "@/components/corporate/auth/Header";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import Footer2 from "@/components/corporate/footerCorporate/footerCorporate";

// Registering the required chart elements
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale
);

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dummy data for the charts
  const flightBookingData = {
    labels: ["Domestic", "International"],
    datasets: [
      {
        data: [60, 40], // Example data: 60% Domestic, 40% International
        backgroundColor: ["#36A2EB", "#FF6384"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  const hotelBookingData = {
    labels: ["Domestic", "International"],
    datasets: [
      {
        data: [55, 45], // Example data: 55% Domestic, 45% International
        backgroundColor: ["#FF9F40", "#FFCD56"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  const employeeExpenseData = {
    labels: ["Employee A", "Employee B", "Employee C", "Employee D"],
    datasets: [
      {
        data: [500, 1200, 700, 300], // Example expenses
        backgroundColor: ["#4BC0C0", "#FFCD56", "#FF6384", "#36A2EB"],
        borderColor: ["#fff", "#fff", "#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  const overallExpenseData = {
    labels: ["Flights", "Hotels"],
    datasets: [
      {
        data: [3000, 5000], // Example overall expenses (Flights: $3000, Hotels: $5000)
        backgroundColor: ["#FF9F40", "#36A2EB"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div className="shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <Header />
      </div>
      <div className="flex">
        {/* Sidebar */}
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}

          {/* Dashboard Content */}
          <main className="p-4 bg-gray-100 flex-1">
            {/* Pie Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Overall Expenses */}
              <div className="bg-white shadow p-4 rounded flex flex-col items-center">
                <h3 className="text-lg font-semibold">
                  Overall Company Expenses
                </h3>
                <Pie data={overallExpenseData} />
              </div>
              {/* Flight Bookings */}
              <div className="bg-white shadow p-4 rounded flex flex-col items-center">
                <h3 className="text-lg font-semibold">Flight Bookings</h3>
                <Pie data={flightBookingData} />
              </div>
            </div>

            {/* Pie Chart for Hotel Bookings and Employee Expenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Hotel Bookings */}
              <div className="bg-white shadow p-4 rounded flex flex-col items-center">
                <h3 className="text-lg font-semibold">Hotel Bookings</h3>
                <Pie data={hotelBookingData} />
              </div>
              {/* Employee Expenses */}
              <div className="bg-white shadow p-4 rounded flex flex-col items-center">
                <h3 className="text-lg font-semibold">Employee Expenses</h3>
                <Pie data={employeeExpenseData} />
              </div>
            </div>
          </main>
        </div>
      </div>
      <div>
        <Footer2 />
      </div>
    </div>
  );
};

export default Dashboard;
