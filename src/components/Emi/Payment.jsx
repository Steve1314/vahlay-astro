import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const EMIPaymentPage = () => {
  const { courseId, emiNumber, planId, userEmail: encodedEmail } = useParams();
  const [emiDetails, setEmiDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  // Handle auth state and email resolution
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        // Prioritize URL email parameter if available
        const emailFromURL = encodedEmail ? decodeURIComponent(encodedEmail) : null;
        
        if (emailFromURL) {
          setUserEmail(emailFromURL);
          return;
        }

        // Fallback to authenticated user's email
        if (user?.email) {
          setUserEmail(user.email);
          return;
        }

        // No email available
        setUserEmail(null);
      } catch (err) {
        setError("Invalid email parameter format");
        setUserEmail(null);
      }
    });

    return () => unsubscribe();
  }, [auth, encodedEmail]);

  // Fetch EMI details when email is available
  useEffect(() => {
    if (!userEmail) {
      if (userEmail === null) { // Only show error if we've finished checking
        setError("User email is required for payment processing");
        setLoading(false);
      }
      return;
    }

    const fetchEMIDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const currentEMI = parseInt(emiNumber, 10);
        if (isNaN(currentEMI) || currentEMI < 1) {
          throw new Error("Invalid EMI number");
        }

        const planRef = doc(db, "emiPlans", planId);
        const planSnap = await getDoc(planRef);
        if (!planSnap.exists()) throw new Error("EMI plan not found");

        const planData = planSnap.data();
        if (currentEMI > planData.duration) {
          throw new Error("EMI number exceeds plan duration");
        }

        setEmiDetails({
          courseId,
          courseName: planData.courseName,
          emiNumber: currentEMI,
          amount: planData.amount,
          dueDate: new Date(),
          planId,
          userEmail,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEMIDetails();
  }, [emiNumber, planId, courseId, userEmail]);



   // Add the initializeRazorpay function
   const initializeRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };


  const handlePayment = async () => {
    try {
      if (!emiDetails?.userEmail) {
        throw new Error("Payment initialization failed: Missing user information");
      }

      setProcessing(true);

      // Create Razorpay order
      const orderResponse = await fetch("https://backend-7e8f.onrender.com/button/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: emiDetails.userEmail,
          courseId: emiDetails.courseId,
          planId: emiDetails.planId,
          emiNumber: emiDetails.emiNumber,
          amount: emiDetails.amount,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const { orderId, amount, currency } = await orderResponse.json();

      // Initialize Razorpay
      const rzpLoaded = await initializeRazorpay();
      if (!rzpLoaded) {
        throw new Error("Payment gateway initialization failed");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount,
        currency,
        name: "Vahlay Astro",
        description: `Payment for ${emiDetails.courseName} - EMI #${emiDetails.emiNumber}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verificationResponse = await fetch("https://backend-7e8f.onrender.com/button/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                paymentData: {
                  userId: emiDetails.userEmail,
                  courseId: emiDetails.courseId,
                  planId: emiDetails.planId,
                  emiNumber: emiDetails.emiNumber,
                  amount: emiDetails.amount,
                },
              }),
            });

            if (!verificationResponse.ok) {
              throw new Error("Payment verification failed");
            }

            // Save successful payment to Firestore
            await setDoc(doc(db, "payments", response.razorpay_payment_id), {
              userId: emiDetails.userEmail,
              courseId: emiDetails.courseId,
              planId: emiDetails.planId,
              emiNumber: emiDetails.emiNumber,
              amount: emiDetails.amount,
              status: "paid",
              timestamp: new Date(),
              transactionId: response.razorpay_payment_id,
              paymentMethod: "razorpay",
            });

            alert("Payment processed successfully!");
            navigate("/home");
          } catch (error) {
            alert(`Payment processing failed: ${error.message}`);
            setLoading(false);
          } finally {
            setProcessing(false);
            setLoading(false);
          }
        },
        prefill: {
          email: emiDetails.userEmail,
          name: "Valued Customer",
        },
        theme: { color: "#F37254" },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      new window.Razorpay(options).open();
    } catch (error) {
      alert(`Payment initialization error: ${error.message}`);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
      </div>
    );
  }




  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 bg-red-50 rounded-lg">
        <h3 className="text-red-600 font-bold text-lg mb-2">Payment Error</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => navigate("/home")}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md my-[15px]">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete EMI Payment</h2>

      <div className="space-y-4 mb-6">
        <DetailItem label="Course Program" value={emiDetails.courseId} />
        <DetailItem label="EMI Installment" value={`#${emiDetails.emiNumber}`} />
        <DetailItem label="Payment Amount" value={`₹${emiDetails.amount.toLocaleString("en-IN")}`} />
        <DetailItem
          label="Due Date"
          value={emiDetails.dueDate.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={processing}
        className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-colors ${
          processing ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {processing ? "Processing Your Payment..." : "Complete Payment Now"}
      </button>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-800 font-semibold">{value}</span>
  </div>
);

export default EMIPaymentPage;
