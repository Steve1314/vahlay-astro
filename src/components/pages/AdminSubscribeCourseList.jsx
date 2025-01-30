import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import Admin from "./Admin"

const AdminEnrolledUsers = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subscriptionsCollection = collection(db, "subscriptions");
        const subscriptionsSnapshot = await getDocs(subscriptionsCollection);
        const subscriptionsData = subscriptionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubscriptions(subscriptionsData);
      } catch (error) {
      }
    };

    fetchSubscriptions();
  }, []);

  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const difference = expiry - today;
    return Math.max(Math.ceil(difference / (1000 * 60 * 60 * 24)), 0);
  };

  const toggleUserDetails = (userId) => {
    setExpandedUser((prevUserId) => (prevUserId === userId ? null : userId));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
<Admin />
      {/* Sidebar */}
      {/* <aside
        className={`w-full md:w-1/5 bg-red-600 text-white p-4 shadow-lg transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:relative top-0 left-0 h-screen z-10`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-2xl font-bold md:hidden"
          >
            ✖
          </button>
        </div>
        <ul className="space-y-4">
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <Link to="/adminarticle">Articles</Link>
          </li>
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <Link to="/adminsubscribecourselist">Subscribe List</Link>
          </li>
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <Link to="/admincalendar">Calendar</Link>
          </li>
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <Link to="/addcourse">Add Course</Link>
          </li>
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <Link to="/addmodule">Add Module</Link>
          </li>
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <Link to="/addmeeting">Add Live Session</Link>
          </li>
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <Link to="/admin/addemi">Add EMI Plans</Link>
          </li>
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <Link to="/admin/emailuserlist">Track EMI Plans</Link>
          </li>
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <Link to="/payment">Payment List</Link>
          </li>

        </ul>
      </aside> */}

      {/* Main Content */}
      <div className="flex-1 p-4 md:ml-20">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-red-600 text-white p-2 rounded-md mb-4 md:hidden"
        >
          Open Sidebar
        </button>
        <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
          Enrolled Users
        </h1>
        {subscriptions.length === 0 ? (
          <p className="text-gray-600 text-center">No enrolled users found.</p>
        ) : (
          <ul className="space-y-4">
            {subscriptions.map((subscription) => (
              <li
                key={subscription.id}
                className="border border-gray-300 rounded-lg p-4 bg-white shadow-md"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleUserDetails(subscription.id)}
                >
                  <h2 className="text-lg font-semibold text-red-600">
                    {subscription.id}
                  </h2>
                  <button className="text-gray-600 hover:text-red-600">
                    {expandedUser === subscription.id
                      ? "Hide Details"
                      : "Show Details"}
                  </button>
                </div>

                {expandedUser === subscription.id && (
                  <div className="mt-4 space-y-4">
                    {subscription.DETAILS?.map((course, index) => (
                      <div
                        key={index}
                        className="border-t border-gray-200 pt-2 text-gray-700"
                      >
                        <p>
                          <span className="font-medium">Course:</span>{" "}
                          {Object.keys(course)[0]}
                        </p>
                        <p>
                          <span className="font-medium">
                            Subscription Date:
                          </span>{" "}
                          {course[Object.keys(course)[0]].subscriptionDate
                            ? new Date(
                                course[Object.keys(course)[0]].subscriptionDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Expiry Date:</span>{" "}
                          {course[Object.keys(course)[0]].expiryDate
                            ? new Date(
                                course[Object.keys(course)[0]].expiryDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          {course[Object.keys(course)[0]].status || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Days Left:</span>{" "}
                          {course[Object.keys(course)[0]].expiryDate
                            ? calculateDaysLeft(
                                course[Object.keys(course)[0]].expiryDate
                              )
                            : "N/A"}
                        </p>
                      </div>
                    ))}

                    {subscription.freecourses && (
                      <div>
                        <p className="font-medium text-gray-800">
                          Free Courses:
                        </p>
                        <ul className="list-disc list-inside">
                          {subscription.freecourses.map((course, index) => (
                            <li key={index} className="text-gray-700">
                              {course}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminEnrolledUsers;
