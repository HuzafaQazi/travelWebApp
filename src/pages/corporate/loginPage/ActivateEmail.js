import { useEffect } from 'react';

const ActivateEmail = () => {
  useEffect(() => {
    // This ensures this code runs only on the client-side
    const container = document.getElementById('root');
    if (container) {
      console.log('Container exists:', container);
    }
  }, []);
  
  // Sample booking details (you can replace this with real data)
  const bookingDetails = {
    getTravelCategory: () => "Flight",
    getTravelDate: () => "2024-12-15",
    getReasonForTravel: () => "Business Trip",
    getDestination: () => "New York",
    getOrigin: () => "Mumbai",
    getTotalBookingAmount: () => 15000
  };

  const employeeName = "John Doe";
  const approverName = "Approver Name";
  const approvalUrl = "#approve";
  const rejectionUrl = "#reject";

  return (
    <>
      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border: 2px solid #028FA3;
        }

        .header {
          display: flex;
          flex-direction:column;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .header img {
          width: 120px;
          height:22px;
        }

        .header h1 {
          font-size: 1.2em;
          margin-top:10px;
        }

        .highlight {
          color: #007bff;
        }

        .btn {
          padding: 10px 20px;
          font-size: 1em;
          border-radius: 5px;
          display: inline-block;
          text-align: center;
          text-decoration: none;
        }

        .btn.approve {
          background-color: #28a745;
          color: #fff;
          margin-right: 10px;
        }

        .btn.reject {
          background-color: #dc3545;
          color: #fff;
        }

        .trip-details {
          margin-top: 20px;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .trip-details h3 {
          font-size: 1.1em;
          color: #007bff;
          margin: 0;
        }

        .trip-details hr {
          border: none;
          border-bottom: 1px solid #ddd;
          margin: 10px 0;
        }

        .total-amount {
          font-weight: bold;
          font-size: 1.1em;
          color: #007bff;
          text-align: right;
          margin-top: 20px;
        }
      `}</style>

      <div className="container">
        <div className="header">
          <img
            src="/img/weyngo_logo.png"
            alt="WeynGo Logo"
          />
          <h1>
            {bookingDetails.getTravelCategory()} Request by {employeeName}
          </h1>
        </div>
        <p>Hello {approverName},</p>
        <p>
          <strong>{employeeName}</strong> has requested for{" "}
          <strong className="highlight">
            {bookingDetails.getTravelCategory()} on {bookingDetails.getTravelDate()}
          </strong>{" "}
          for <strong>{bookingDetails.getReasonForTravel()}</strong>.
        </p>
        <div style={{ marginTop: '20px' }}>
          <a href={approvalUrl} className="btn approve">
            APPROVE
          </a>
          <a href={rejectionUrl} className="btn reject">
            REJECT
          </a>
        </div>
        <div className="trip-details">
          <h3>TRIP DETAILS</h3>
          <hr />
          <p>Stay at {bookingDetails.getDestination()}</p>
          <p>🏢 Hotel: {bookingDetails.getDestination()}</p>
          <p><span>📅 Date: {bookingDetails.getTravelDate()}</span></p>
          <p><span>✈️ Route: {bookingDetails.getOrigin()} - {bookingDetails.getDestination()}</span></p>
          <p><span>👥 Traveler: {employeeName}</span></p>
          <hr />
          <div className="total-amount">
            Total Amount: Rs. {bookingDetails.getTotalBookingAmount()}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivateEmail;
