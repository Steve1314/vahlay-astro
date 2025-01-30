import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SubmissionSuccess = () => {
  const location = useLocation(); // Retrieve data passed from the previous page
  const navigate = useNavigate();

  // Extract data from location state
  const { firstName, availableDate, isNewUser } = location.state || {};

  const handleExploreMore = () => {
    navigate("/home"); // Redirect to home page
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">Submission Successful!</h2>

      <p className="text-lg text-gray-700 mb-6">
        {isNewUser && !availableDate ? (
          <>
            Hello, {firstName}!
            <br />
            Thank you for reaching out to us. We’re excited to assist you and ensure your experience is exceptional.  
            <br />
            One of our agents will contact you shortly to schedule your appointment and address your needs with care and professionalism.
          </>
        ) : (
          <>
            Hello, {firstName}!
            <br />
            Your appointment request has been successfully submitted. Our agent will contact you on{" "}
            <span className="font-bold text-gray-800">{availableDate}</span> to assist you further.
          </>
        )}
      </p>

      <button
        onClick={handleExploreMore}
        className="mt-6 py-2 px-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-700"
      >
        Explore More
      </button>
    </div>
  );
};

export default SubmissionSuccess;
