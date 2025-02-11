import React, { useState, useEffect } from "react";

const PaymentGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Auto-hide tooltip after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Floating Button with Tooltip */}
      <div className="fixed bottom-6 left-6 flex flex-col items-center">
        {/* Tooltip with arrow effect */}
        {showTooltip && (
          <div className="relative mb-2 bg-white text-gray-800 text-sm font-medium px-3 py-2 rounded-lg shadow-md animate-fadeIn">
            <span>Check how to complete payment smoothly</span>
            <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-t-8 border-transparent border-b-8 border-b-white border-l-8 border-r-8 border-l-transparent border-r-transparent"></div>
          </div>
        )}

        {/* Circular Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-red-600 shadow-lg text-white hover:bg-red-700 transition-transform transform hover:scale-110"
        >
          🎥
        </button>
      </div>

      {/* Payment Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full animate-slideUp">
            <h2 className="text-xl font-bold mb-4 text-red-600 text-center">Payment Guide</h2>

            {/* Video Section */}
            <div className="mb-4">
              <video
                controls
                className="w-full rounded-lg shadow-md"
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Text Content */}
            <p className="text-gray-700 text-center">
              Follow these steps to complete your payment smoothly:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mt-2">
              <li>Choose your preferred payment method (Razorpay, PayPal, Installments).</li>
              <li>Ensure your card or UPI is enabled for online transactions.</li>
              <li>Wait for the payment confirmation before closing the page.</li>
              <li>If payment fails, try again or contact support.</li>
            </ul>

            {/* Close Button */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentGuide;
