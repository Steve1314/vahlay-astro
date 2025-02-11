
import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import Admin from "../pages/Admin"

/**
 * Helper to group an array of payments by "courseId".
 * Example Output:
 * {
 *   'course1': [paymentDoc, paymentDoc],
 *   'course2': [paymentDoc]
 * }
 */
function groupPaymentsByCourse(paymentsArray) {
  return paymentsArray.reduce((acc, payment) => {
    const { courseId } = payment;
    if (!acc[courseId]) acc[courseId] = [];
    acc[courseId].push(payment);
    return acc;
  }, {});
}

const AdminEMITracking = () => {
  const { email } = useParams(); // Get user email from route params

  const [paymentsByCourse, setPaymentsByCourse] = useState({});
  const [emiPlans, setEmiPlans] = useState([]);
  const [emiSchedules, setEmiSchedules] = useState({});
  const [loading, setLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Fetch all payments for this user
  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const paymentsQueryRef = query(
      collection(db, "payments"),
      where("userId", "==", email)
    );

    const unsubPayments = onSnapshot(paymentsQueryRef, (snapshot) => {
      const allPayments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const grouped = groupPaymentsByCourse(allPayments);
      setPaymentsByCourse(grouped);
      setLoading(false);
    });

    return () => unsubPayments();
  }, [email]);

  // 2. Fetch EMI plans
  useEffect(() => {
    const unsubPlans = onSnapshot(collection(db, "emiPlans"), (snapshot) => {
      const plans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEmiPlans(plans);
    });

    return () => unsubPlans();
  }, []);

  // 3. Generate EMI schedules
  useEffect(() => {
    const updatedSchedules = {};

    Object.keys(paymentsByCourse).forEach((courseId) => {
      const userPayments = paymentsByCourse[courseId] || [];

      const plan = emiPlans.find(
        (p) =>
          p.courseId === courseId &&
          Number(p.amount) === Number(userPayments[0]?.amount)
      );

      if (!plan) return;

      const totalEMIs = parseInt(plan.duration || 0, 10);
      const sortedPayments = userPayments.sort((a, b) => {
        const aDate = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const bDate = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return aDate - bDate;
      });

      const firstPaymentDate =
        sortedPayments[0]?.timestamp?.toDate?.() ||
        new Date(sortedPayments[0]?.timestamp) ||
        new Date();

      const schedule = [];
      for (let i = 0; i < totalEMIs; i++) {
        const emiDate = new Date(firstPaymentDate);
        emiDate.setMonth(emiDate.getMonth() + i);

        schedule.push({
          emiNumber: i + 1,
          date: emiDate,
          amount: plan.amount,
          status: i < sortedPayments.length ? "paid" : "unpaid",
        });
      }

      updatedSchedules[courseId] = schedule;
    });

    setEmiSchedules(updatedSchedules);
  }, [paymentsByCourse, emiPlans]);

  // 4. Send a reminder for a specific EMI
  const sendReminder = async (courseId, emiNumber, emiDate) => {
    try {
      const reminderMessage = `Reminder: Your EMI #${emiNumber} for course (${courseId}) is due on ${emiDate.toLocaleDateString()}. Please pay to avoid penalties.`;

      await addDoc(collection(db, "notifications"), {
        userId: email,
        message: reminderMessage,
        timestamp: new Date(),
        status: "unread", // can be marked read by user
      });

      // Make API call to send email
      const response = await fetch('https://backend-7e8f.onrender.com/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email,
          subject: `EMI Reminder for Course ${courseId}`,
          message: reminderMessage,
        }),
      });

      if (response.ok) {
        alert(`Email reminder sent for EMI #${emiNumber} of ${courseId}`);
      } else {
        alert('Failed to send email reminder.');
      }
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };


  // ====================== RENDER ======================

  if (loading) return <p>Loading...</p>;
  if (!email) return <p>No user email provided in the route.</p>;
  if (Object.keys(paymentsByCourse).length === 0) {
    return <p>No payments found for {email}.</p>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <Admin/>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white shadow rounded p-6 border border-red-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
          >
            Open Menu
          </button>

          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Admin EMI Tracking for {email}
          </h2>

          {Object.keys(emiSchedules).map((courseId) => {
            const schedule = emiSchedules[courseId] || [];
            const userPayments = paymentsByCourse[courseId] || [];

            const paidEMIs = userPayments.length;
            const totalEMIs = schedule.length;
            const remainingEMIs = totalEMIs - paidEMIs;

            return (
              <div
                key={courseId}
                className="mb-6 border border-red-200 shadow-sm rounded p-4"
              >
                <h3 className="text-xl font-semibold mb-2 text-red-600">
                  {emiPlans.find((plan) => plan.courseId === courseId)?.courseName || `Course ID: ${courseId}`}
                </h3>

                <p className="mb-4 text-gray-800">
                  <span className="font-medium">Total EMIs</span>: {totalEMIs},{" "}
                  <span className="font-medium">Paid</span>: {paidEMIs},{" "}
                  <span className="font-medium">Remaining</span>: {remainingEMIs}
                </p>

                <h4 className="text-lg font-bold mb-2 text-red-600">EMI Schedule</h4>
                <ul>
                  {schedule.map((emi) => (
                    <li
                      key={emi.emiNumber}
                      className="flex justify-between mb-2 items-center"
                    >
                      <div className="text-gray-800">
                        <span className="font-medium">EMI #{emi.emiNumber}</span> — Due on {emi.date.toLocaleDateString()} — ₹{emi.amount}
                      </div>
                      {emi.status === "paid" ? (
                        <span className="bg-red-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors duration-200">
                          Paid
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            sendReminder(courseId, emi.emiNumber, emi.date)
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors duration-200"
                        >
                          Send Reminder
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                <h4 className="text-lg font-bold mt-4 mb-2 text-red-600">Paid EMIs</h4>
                {userPayments.length === 0 ? (
                  <p className="text-gray-800">No paid EMIs yet.</p>
                ) : (
                  <ul className="list-disc list-inside text-gray-800">
                    {userPayments.map((payment, idx) => (
                      <li key={payment.id} className="mb-1">
                        <span className="font-medium">EMI #{idx + 1}</span> — ₹{payment.amount} — Paid on {new Date(payment.timestamp.toDate()).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminEMITracking;

