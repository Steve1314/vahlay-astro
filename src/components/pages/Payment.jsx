import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "payments"));
        const paymentsData = [];
        let total = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Convert Firestore timestamp to JavaScript Date
          const timestamp = data.timestamp?.toDate?.() || data.timestamp;
          const payment = {
            id: doc.id,
            amount: data.amount,
            courseId: data.courseId,
            paymentId: data.paymentId,
            status: data.status,
            timestamp: timestamp ? new Date(timestamp).toLocaleString() : "Invalid Date",
            userId: data.userId,
          };

          paymentsData.push(payment);
          total += Number(data.amount || 0);
        });

        setPayments(paymentsData);
        setTotalAmount(total);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside
        className={`w-full h-screen md:w-1/6 bg-red-600 text-white p-4 shadow-lg transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:relative fixed top-0 left-0 z-10`}
      >
        <div className="flex justify-between items-center mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-2xl font-bold"
          >
            ✖
          </button>
        </div>
        <ul className="mt-4">
          <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
            <a href="/adminarticle">Articles</a>
          </li>
          <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
            <a href="/admincalendar">Calendar</a>
          </li>
          <li className="p-2 hover:bg-white hover:text-red-600 rounded">
            <a href="/adminsubscribecourselist">Subscribe List</a>
          </li>
          <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
            <a href="/addcourse">Add Course</a>
          </li>
          <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
            <a href="/addmodule">Add Module</a>
          </li>
          <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
            <a href="/addmeeting">Add Live Session</a>
          </li>
          <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
            <a href="/admin/addemi">Add EMI Plans</a>
          </li>
          <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
            <a href="/admin/emailuserlist">Track EMI Plans</a>
          </li>
          <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
            <a href="/payment">Payment List</a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white overflow-auto">
        <div className="max-w-6xl mx-auto bg-white shadow rounded p-6 border border-red-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
          >
            Open Menu
          </button>

          <h2 className="text-2xl font-bold mb-4 text-red-600 text-center">
            Payments List
          </h2>

          {loading ? (
            <p className="text-center text-red-600">Loading...</p>
          ) : payments.length === 0 ? (
            <p className="text-center text-red-600">No payments found.</p>
          ) : (
            <>
              {/* Table View for Larger Screens */}
              <div className="hidden md:block overflow-x-auto h-[60vh]">
                <table className="w-full border-collapse border border-gray-200 text-left">
                  <thead>
                    <tr className="bg-red-50">
                      <th className="border px-4 py-2">#</th>
                      <th className="border px-4 py-2">User ID</th>
                      <th className="border px-4 py-2">Course ID</th>
                      <th className="border px-4 py-2">Amount</th>
                      <th className="border px-4 py-2">Status</th>
                      <th className="border px-4 py-2">Payment ID</th>
                      <th className="border px-4 py-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={payment.id} className="hover:bg-red-50">
                        <td className="border px-4 py-2">{index + 1}</td>
                        <td className="border px-4 py-2">{payment.userId}</td>
                        <td className="border px-4 py-2">{payment.courseId}</td>
                        <td className="border px-4 py-2">₹{payment.amount}</td>
                        <td className="border px-4 py-2">{payment.status}</td>
                        <td className="border px-4 py-2">{payment.paymentId}</td>
                        <td className="border px-4 py-2">{payment.timestamp}</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-red-100 font-bold">
                      <td colSpan="3" className="border px-4 py-2 text-right">
                        Total Payments:
                      </td>
                      <td colSpan="4" className="border px-4 py-2">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Card View for Mobile Screens */}
              <div className="block md:hidden">
                {payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="bg-red-50 mb-4 p-4 rounded shadow border border-gray-200"
                  >
                    <h3 className="text-lg font-bold text-red-600">
                      Payment #{index + 1}
                    </h3>
                    <p className="text-gray-700">
                      <strong>User ID:</strong> {payment.userId}
                    </p>
                    <p className="text-gray-700">
                      <strong>Course ID:</strong> {payment.courseId}
                    </p>
                    <p className="text-gray-700">
                      <strong>Amount:</strong> ₹{payment.amount}
                    </p>
                    <p className="text-gray-700">
                      <strong>Status:</strong> {payment.status}
                    </p>
                    <p className="text-gray-700">
                      <strong>Payment ID:</strong> {payment.paymentId}
                    </p>
                    <p className="text-gray-700">
                      <strong>Timestamp:</strong> {payment.timestamp}
                    </p>
                  </div>
                ))}
                <div className="bg-red-100 p-4 rounded shadow mt-4">
                  <h3 className="text-lg font-bold text-red-600">Total Payments:</h3>
                  <p className="text-gray-700">₹{totalAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentsList;
