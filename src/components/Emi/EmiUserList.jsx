
import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Admin from "../pages/Admin";
const AdminEMIUsers = () => {
  const [emiUsers, setEmiUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payments"), (snapshot) => {
      const usersMap = new Map();

      snapshot.docs.forEach((doc) => {
        const paymentData = doc.data();
        if (paymentData.userId) {
          if (!usersMap.has(paymentData.userId)) {
            usersMap.set(paymentData.userId, {
              email: paymentData.userId,
              payments: [],
            });
          }
          usersMap.get(paymentData.userId).payments.push(paymentData);
        }
      });

      setEmiUsers(Array.from(usersMap.values()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar - Always visible on desktop and mobile */}
      <div className="w-full md:w-1/4 bg-white shadow-md">
        <Admin />
      </div>

      <div className="w-full md:w-3/4 px-4 sm:px-6 py-8 mx-auto">
        <div className="max-w-6xl mx-auto bg-white shadow rounded p-6 border border-red-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
          >
            Open Menu
          </button>

          <h2 className="text-2xl font-bold mb-4 text-red-600">EMI Enrolled Users</h2>

          {loading ? (
            <p className="text-red-600">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <table className="min-w-full bg-white border border-gray-200 text-left">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="px-4 py-2 border-b text-red-600 font-semibold">Email</th>
                      <th className="px-4 py-2 border-b text-red-600 font-semibold">
                        Number of Payments
                      </th>
                      <th className="px-4 py-2 border-b text-red-600 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emiUsers.length > 0 ? (
                      emiUsers.map((user, index) => (
                        <tr
                          key={index}
                          className="hover:bg-red-50 transition-colors duration-200"
                        >
                          <td className="px-4 py-2 border-b break-words">{user.email}</td>
                          <td className="px-4 py-2 border-b">{user.payments.length}</td>
                          <td className="px-4 py-2 border-b">
                            <button
                              onClick={() =>
                                navigate(`/admin/emailuserlist/${user.email}`)
                              }
                              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-red-600">
                          No users found in the payments database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden">
                {emiUsers.length > 0 ? (
                  emiUsers.map((user, index) => (
                    <div
                      key={index}
                      className="bg-red-50 p-4 mb-4 rounded shadow border border-gray-200"
                    >
                      <p className="text-lg font-semibold text-red-600 mb-2 break-words">
                        {user.email}
                      </p>
                      <p className="text-gray-700 mb-2">
                        Number of Payments: {user.payments.length}
                      </p>
                      <button
                        onClick={() => navigate(`/admin/emailuserlist/${user.email}`)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200 w-full"
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-red-600">No users found in the payments database.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEMIUsers;