import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

const SelectionPage = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Show the modal when the component is rendered
    setIsModalVisible(true);
  }, []);

  const handleSelection = (userType) => {
    if (userType === "new") {
      navigate("/newuser");
    } else if (userType === "old") {
      navigate("/olduser");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-800 via-red-600 to-red-500 flex items-center justify-center overflow-hidden">
      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Modal Content */}
          <div className="bg-gradient-to-br from-red-600 to-pink-500 rounded-3xl shadow-2xl p-8 w-[90%] max-w-lg transform transition-all scale-100 hover:scale-105">
            <h2 className="text-2xl font-extrabold text-white mb-4 text-center">
              Welcome!
            </h2>
            <p className="text-white text-center mb-8">
              Are you a new user or an existing user? Please select an option to
              continue  for book an appointment.
            </p>
            <div className="flex justify-center space-x-6">
              <button
                onClick={() => handleSelection("new")}
                className="bg-white text-red-600 px-6 py-3 rounded-full shadow-md hover:bg-red-100 hover:shadow-lg transition-all duration-300"
              >
                New User
              </button>
              <button
                onClick={() => handleSelection("old")}
                className="bg-white text-pink-600 px-6 py-3 rounded-full shadow-md hover:bg-pink-100 hover:shadow-lg transition-all duration-300"
              >
                Old User
              </button>
            </div>
            <button
              onClick={() => setIsModalVisible(false)}
              className="mt-6 block mx-auto text-white underline hover:text-gray-300 transition-all duration-300"
            >
              <Link to ="/home">Cancel</Link>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionPage;
