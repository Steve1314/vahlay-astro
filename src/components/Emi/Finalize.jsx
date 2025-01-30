
// import React, { useEffect, useState } from "react";
// import { db } from "../../firebaseConfig";
// import { collection, query, where, onSnapshot, addDoc, doc, getDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";
// import { Link } from "react-router-dom";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// const EMIDetails = () => {
//   const [userEmail, setUserEmail] = useState(null);
//   const [payments, setPayments] = useState([]);

//   const [currentUser, setCurrentUser] = useState(null);

//   const [emiPlans, setEmiPlans] = useState([]);
//   const [emiSchedules, setEmiSchedules] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;
//   const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     profilePic: "",
//     fullName: "NA",
//     fathersName: "NA",
//     mothersName: "NA",
//     dob: "NA",
//     email: "NA",
//   });
//   const [paymentModal, setPaymentModal] = useState({
//     isOpen: false,
//     courseId: null,
//     emiNumber: null,
//     amount: null,
//   });

//   const loadPayPalScript = async () => {
//     if (!document.querySelector("#paypal-sdk")) {
//       const script = document.createElement("script");
//       script.id = "paypal-sdk";
//       script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
//       script.async = true;
//       document.body.appendChild(script);
//       return new Promise((resolve, reject) => {
//         script.onload = resolve;
//         script.onerror = reject;
//       });
//     }
//   };

//   // Call this function before rendering the PayPal button
//   const openPaymentModal = async (courseId, emiNumber, amount) => {
//     try {
//       // await loadPayPalScript();
//       setPaymentModal({
//         isOpen: true,
//         courseId,
//         emiNumber,
//         amount,
//       });
//     } catch (error) {
//       alert("Failed to initialize PayPal. Please try again.");
//     }
//   };


//   const closePaymentModal = () => {
//     setPaymentModal({ isOpen: false, courseId: null, emiNumber: null, amount: null });
//   };


//   const fetchUSDConversionRate = async () => {
//     try {
//       const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR"); // Replace with your preferred API
//       const data = await response.json();
//       return data.rates.USD || 0; // Return the USD rate
//     } catch (error) {
//       return 0; // Default to 0 on error
//     }
//   };






//   const PaymentModal = () => {
//     const [usdAmount, setUsdAmount] = useState(null); // State to store the USD amount
//     const [error, setError] = useState(null);

//     useEffect(() => {
//       // Fetch USD conversion rate when the modal opens
//       const fetchUSDConversionRate = async () => {
//         try {
//           const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
//           const data = await response.json();
//           const conversionRate = data.rates.USD || 80; // Fallback rate
//           setUsdAmount((paymentModal.amount * conversionRate).toFixed(2));
//         } catch (err) {
//           setError("Failed to fetch USD conversion rate.");
//         }
//       };

//       fetchUSDConversionRate();
//     }, [paymentModal.amount]);

//     if (!paymentModal.isOpen) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
//         <div className="bg-white rounded-lg shadow-lg p-6 w-96">
//           <h3 className="text-xl font-bold mb-4 text-red-600">Select Payment Method</h3>
//           <p className="mb-6">
//             EMI #{paymentModal.emiNumber} for Course {paymentModal.courseId} - ₹
//             {Number(paymentModal.amount).toLocaleString("en-IN")}
//           </p>
//           {error && <p className="text-red-500">{error}</p>}
//           <div className="flex flex-col gap-4">
//             <button
//               onClick={() =>
//                 handlePayment(
//                   paymentModal.courseId,
//                   paymentModal.emiNumber,
//                   paymentModal.amount,
//                   "razorpay"
//                 )
//               }
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
//             >
//               Pay with Razorpay
//             </button>
//             {usdAmount ? (
//               <PayPalScriptProvider
//                 options={{
//                   "client-id": PAYPAL_CLIENT_ID,
//                   components: "buttons",
//                   currency: "USD",
//                 }}
//               >
//                 <PayPalButtons
//                   style={{ layout: "vertical" }}
//                   createOrder={(data, actions) => {
//                     return actions.order.create({
//                       purchase_units: [
//                         {
//                           amount: {
//                             currency_code: "USD",
//                             value: usdAmount, // Dynamically set
//                           },
//                         },
//                       ],
//                     });
//                   }}
//                   onApprove={async (data, actions) => {
//                     try {
//                       const details = await actions.order.capture();
//                       const paymentId = details.id;

//                       const userDetails = {
//                         email: userEmail, // Replace with user's email
//                         name: formData.fullName || "NA", // Replace with user's name
//                       };

//                       const backendResponse = await fetch("https://backend-7e8f.onrender.com/api/final/paypal/success", {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                           paymentId,
//                           userDetails,
//                           amount: paymentModal.amount,
//                           courseId: paymentModal.courseId,
//                         }),
//                       });

//                       if (!backendResponse.ok) {
//                         const errorData = await backendResponse.json();
//                         alert(`Error: ${errorData.error}`);
//                         return;
//                       }

//                       // Add payment to Firestore
//                       await addDoc(collection(db, "payments"), {
//                         userId: userEmail,
//                         courseId: paymentModal.courseId,
//                         emiNumber: paymentModal.emiNumber,
//                         amount: paymentModal.amount,
//                         paymentId,
//                         status: "paid",
//                         timestamp: new Date(),
//                       });

//                       alert(`Payment for EMI #${paymentModal.emiNumber} successful via PayPal!`);
//                       closePaymentModal();
//                     } catch (error) {
//                       alert("An error occurred during payment. Please try again.");
//                     }
//                   }}
//                   onError={(err) => {
//                     alert("An error occurred during the PayPal payment process.");
//                   }}
//                 />
//               </PayPalScriptProvider>

//             ) : (
//               <p className="text-gray-500">Loading PayPal options...</p>
//             )}
//             <button
//               onClick={closePaymentModal}
//               className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   //handlePaymentSuccess(paymentModal.courseId, paymentModal.emiNumber, paymentModal.amount, details.id);


//   const handlePayment = async (courseId, emiNumber, amount, paymentMethod) => {
//     try {
//       const amountInPaise = Number(amount) * 100; // Amount for Razorpay

//       if (paymentMethod === "razorpay") {
//         const options = {
//           key: RAZORPAY_KEY,
//           amount: amountInPaise,
//           currency: "INR",
//           name: "EMI Payment",
//           description: `Pay EMI #${emiNumber} for course ${courseId}`,
//           handler: async (response) => {
//             try {
//               // Handle payment success
//               const paymentDetails = {
//                 paymentId: response.razorpay_payment_id,
//                 courseId,
//                 emiNumber,
//                 amount,
//                 userEmail: userEmail,
//               };

//               // Send payment details to the backend
//               const res = await fetch("https://backend-7e8f.onrender.com/api/final/success", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(paymentDetails),
//               });

//               if (!res.ok) {
//                 throw new Error("Failed to communicate with the backend.");
//               }

//               // Notify the user and admin via email (handled in backend)
//               const result = await res.json();

//               if (result.success) {
//                 handlePaymentSuccess(courseId, emiNumber, amount, response.razorpay_payment_id);
//                 alert("Payment successful! Emails have been sent.");
//               } else {
//                 throw new Error(result.message || "Failed to send emails.");
//               }
//             } catch (err) {
//               alert("Payment was successful, but there was an issue processing the response.");
//             }
//           },
//           prefill: {
//             name: formData.name,
//             email: formData.email,
//           },
//           theme: { color: "#F37254" },
//         };

//         const razorpay = new window.Razorpay(options);
//         razorpay.open();
//       }
//     } catch (error) {
//       alert("Payment failed. Check Contact for details.");
//     }
//   };

//   const handlePaymentSuccess = async (courseId, emiNumber, amount, paymentId) => {
//     try {
//       await addDoc(collection(db, "payments"), {
//         userId: userEmail,
//         courseId,
//         amount: Number(amount),
//         status: "paid",
//         timestamp: new Date(),
//         paymentId,
//       });

//       alert(`Payment for EMI #${emiNumber} successful!`);
//       closePaymentModal();
//     } catch (error) {
//       alert("Failed to record payment. Please try again.");
//     }
//   };

//   useEffect(() => {
//     const auth = getAuth();
//     const currentUser = auth.currentUser;

//     if (currentUser) {
//       setUser(currentUser);
//       setUserEmail(currentUser.email);

//       const fetchProfile = async () => {
//         const userDocRef = doc(db, "students", currentUser.uid);
//         const userDoc = await getDoc(userDocRef);

//         if (userDoc.exists()) {
//           const userData = userDoc.data();
//           setFormData({
//             profilePic: userData.profilePic || "",
//             fullName: userData.fullName || "NA",
//             fathersName: userData.fathersName || "NA",
//             mothersName: userData.mothersName || "NA",
//             dob: userData.dob || "NA",
//             email: currentUser.email || "NA",
//           });
//         }
//       };

//       fetchProfile();
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!userEmail) {
//       setLoading(false);
//       return;
//     }

//     const paymentsQueryRef = query(
//       collection(db, "payments"),
//       where("userId", "==", userEmail)
//     );

//     const paymentsUnsubscribe = onSnapshot(paymentsQueryRef, (snapshot) => {
//       const userPayments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setPayments(userPayments);
//     });

//     return () => paymentsUnsubscribe();
//   }, [userEmail]);

//   useEffect(() => {
//     if (payments.length === 0) return;

//     const plansUnsubscribe = onSnapshot(collection(db, "emiPlans"), (snapshot) => {
//       const allEmiPlans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setEmiPlans(allEmiPlans);
//     });

//     return () => plansUnsubscribe();
//   }, [payments]);

//   useEffect(() => {
//     if (payments.length === 0 || emiPlans.length === 0) return;

//     const updatedSchedules = {};

//     payments.forEach((payment) => {
//       const { courseId, amount } = payment;
//       const relevantPlan = emiPlans.find(
//         (plan) => plan.courseId === courseId && Number(plan.amount) === Number(amount)
//       );

//       if (!relevantPlan) return;

//       const totalEMIs = parseInt(relevantPlan.duration || 0, 10);
//       const sortedPayments = payments
//         .filter((p) => p.courseId === courseId)
//         .sort((a, b) => {
//           const aDate = a.timestamp?.toDate?.() || new Date(a.timestamp);
//           const bDate = b.timestamp?.toDate?.() || new Date(b.timestamp);
//           return aDate - bDate;
//         });

//       const firstPaymentDate =
//         sortedPayments[0]?.timestamp?.toDate?.() ||
//         new Date(sortedPayments[0]?.timestamp) ||
//         new Date();

//       const schedule = [];

//       for (let i = 0; i < totalEMIs; i++) {
//         const emiDate = new Date(firstPaymentDate);
//         emiDate.setMonth(emiDate.getMonth() + i);

//         schedule.push({
//           emiNumber: i + 1,
//           date: emiDate,
//           amount: relevantPlan.amount,
//           status: i < sortedPayments.length ? "paid" : "unpaid",
//         });
//       }

//       updatedSchedules[courseId] = schedule;
//     });

//     setEmiSchedules(updatedSchedules);
//     setLoading(false);
//   }, [payments, emiPlans]);


//   return (
//     <div className="flex flex-col md:flex-row h-screen min-h-screen">
//       <aside
//         className={`w-full md:w-64 bg-red-600 text-white p-4 shadow-lg transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//           } md:translate-x-0 fixed md:relative h-full z-10`}
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold">Dashboard</h1>
//           <button
//             onClick={() => setIsSidebarOpen(false)}
//             className="md:hidden text-2xl font-bold"
//           >
//             ✖
//           </button>
//         </div>
//         <div className="p-6 flex flex-col items-center">
//           <img
//             src={formData.profilePic || "https://via.placeholder.com/100"}
//             alt="Profile"
//             className="rounded-full mb-4 w-24 h-24 object-cover"
//           />
//           <h2 className="text-lg font-bold">{user?.displayName || "User"}</h2>
//         </div>
//         <nav className="p-4">
//           <ul className="space-y-4">
//             <li>
//               <Link
//                 to="/profile"
//                 className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
//               >
//                 My Profile
//               </Link>
//             </li>
//             <li>
//               <Link
//                 to="/dashboard"
//                 className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
//               >
//                 Enrolled Courses
//               </Link>
//             </li>
//             <li>
//               <Link
//                 to="/courses"
//                 className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
//               >
//                 Add Courses
//               </Link>
//             </li>
//             <li>
//               <Link
//                 to="/finalize"
//                 className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
//               >
//                 Payments
//               </Link>
//             </li>
//           </ul>
//         </nav>
//       </aside>

//       <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto bg-white shadow rounded border border-red-200 text-gray-800">
//         <h2 className="text-2xl font-bold mb-4 text-red-600">
//           EMI Details for {userEmail}
//         </h2>

//         {Object.keys(emiSchedules).map((courseId) => {
//           const schedule = emiSchedules[courseId] || [];
//           const unpaidEMIs = schedule.filter((emi) => emi.status === "unpaid");
//           const totalUnpaid = unpaidEMIs.reduce(
//             (sum, emi) => sum + Number(emi.amount),
//             0
//           );

//           return (
//             <div key={courseId} className="mb-8 border border-red-100 rounded p-4">
//               <h3 className="text-lg font-semibold mb-2 text-red-600">
//                 Course: {courseId}
//               </h3>
//               <ul>
//                 {schedule.map((emi, idx) => (
//                   <li key={idx} className="flex justify-between items-center mb-2">
//                     <span>
//                       EMI #{emi.emiNumber} — Due on {emi.date.toLocaleDateString("en-IN")} — ₹
//                       {Number(emi.amount).toLocaleString("en-IN")}
//                     </span>
//                     {emi.status === "paid" ? (
//                       <span className="bg-green-500 text-white px-4 py-1 rounded">
//                         Paid
//                       </span>
//                     ) : (
//                       <button
//                         onClick={() => openPaymentModal(courseId, emi.emiNumber, emi.amount)}
//                         className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
//                       >
//                         Pay
//                       </button>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           );
//         })}
//         <PaymentModal />
//       </div>
//     </div>
//   );
// };

// export default EMIDetails;






import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, onSnapshot, addDoc, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const EMIDetails = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [payments, setPayments] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);

  const [emiPlans, setEmiPlans] = useState([]);
  const [emiSchedules, setEmiSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
     const [isLoading, setIsLoading] = useState(false);
  

  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    profilePic: "",
    fullName: "NA",
    fathersName: "NA",
    mothersName: "NA",
    dob: "NA",
    email: "NA",
  });
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    courseId: null,
    emiNumber: null,
    amount: null,
  });

  const loadPayPalScript = async () => {
    if (!document.querySelector("#paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      document.body.appendChild(script);
      return new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }
  };

  // Call this function before rendering the PayPal button
  const openPaymentModal = async (courseId, emiNumber, amount) => {
    try {
      // await loadPayPalScript();
      setPaymentModal({
        isOpen: true,
        courseId,
        emiNumber,
        amount,
      });
    } catch (error) {
      alert("Failed to initialize PayPal. Please try again.");
    }
  };


  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, courseId: null, emiNumber: null, amount: null });
  };


  const fetchUSDConversionRate = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR"); // Replace with your preferred API
      const data = await response.json();
      return data.rates.USD || 0; // Return the USD rate
    } catch (error) {
      return 0; // Default to 0 on error
    }
  };






  const PaymentModal = () => {
    const [usdAmount, setUsdAmount] = useState(null); // State to store the USD amount
    const [error, setError] = useState(null);

    useEffect(() => {
      // Fetch USD conversion rate when the modal opens
      const fetchUSDConversionRate = async () => {
        try {
          const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
          const data = await response.json();
          const conversionRate = data.rates.USD || 80; // Fallback rate
          setUsdAmount((paymentModal.amount * conversionRate).toFixed(2));
        } catch (err) {
          setError("Failed to fetch USD conversion rate.");
        }
      };

      fetchUSDConversionRate();
    }, [paymentModal.amount]);

    if (!paymentModal.isOpen) return null;


    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <h3 className="text-xl font-bold mb-4 text-red-600">Select Payment Method</h3>
          <p className="mb-6">
            EMI #{paymentModal.emiNumber} for Course {paymentModal.courseId} - ₹
            {Number(paymentModal.amount).toLocaleString("en-IN")}
          </p>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex flex-col gap-4">
            <button
              onClick={() =>
                handlePayment(
                  paymentModal.courseId,
                  paymentModal.emiNumber,
                  paymentModal.amount,
                  "razorpay"
                )
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
              disabled={isLoading}
            >
            {isLoading ? (
    <>
      <svg
        className="animate-spin h-5 w-5 mr-2 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        ></path>
      </svg>
      Processing...
    </>
  ) : (
    "Pay with Razorpay"
  )}
</button>
            {usdAmount ? (
              <PayPalScriptProvider
                options={{
                  "client-id": PAYPAL_CLIENT_ID,
                  components: "buttons",
                  currency: "USD",
                }}
              >
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            currency_code: "USD",
                            value: usdAmount, // Dynamically set
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      const details = await actions.order.capture();
                      const paymentId = details.id;

                      const userDetails = {
                        email: userEmail, // Replace with user's email
                        name: formData.fullName || "NA", // Replace with user's name
                      };

                      const backendResponse = await fetch("https://backend-7e8f.onrender.com/api/final/paypal/success", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          paymentId,
                          userDetails,
                          amount: paymentModal.amount,
                          courseId: paymentModal.courseId,
                        }),
                      });

                      if (!backendResponse.ok) {
                        const errorData = await backendResponse.json();
                        alert(`Error: ${errorData.error}`);
                        return;
                      }

                      // Add payment to Firestore
                      await addDoc(collection(db, "payments"), {
                        userId: userEmail,
                        courseId: paymentModal.courseId,
                        emiNumber: paymentModal.emiNumber,
                        amount: paymentModal.amount,
                        paymentId,
                        status: "paid",
                        timestamp: new Date(),
                      });

                      alert(`Payment for EMI #${paymentModal.emiNumber} successful via PayPal!`);
                      closePaymentModal();
                    } catch (error) {
                      alert("An error occurred during payment. Please try again.");
                    }
                  }}
                  onError={(err) => {
                    alert("An error occurred during the PayPal payment process.");
                  }}
                />
              </PayPalScriptProvider>

            ) : (
              <p className="text-gray-500">Loading PayPal options...</p>
            )}
            <button
              onClick={closePaymentModal}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  //handlePaymentSuccess(paymentModal.courseId, paymentModal.emiNumber, paymentModal.amount, details.id);


  const handlePayment = async (courseId, emiNumber, amount, paymentMethod) => {
    try {
      const amountInPaise = Number(amount) * 100; // Amount for Razorpay

      if (paymentMethod === "razorpay") {

        setIsLoading(true); 
        const options = {
          key: RAZORPAY_KEY,
          amount: amountInPaise,
          currency: "INR",
          name: "EMI Payment",
          description: `Pay EMI #${emiNumber} for course ${courseId}`,
          handler: async (response) => {
            try {
              // Handle payment success
              const paymentDetails = {
                paymentId: response.razorpay_payment_id,
                courseId,
                emiNumber,
                amount,
                userEmail: userEmail,
              };

              // Send payment details to the backend
              const res = await fetch("https://backend-7e8f.onrender.com/api/final/success", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentDetails),
              });

              if (!res.ok) {
                throw new Error("Failed to communicate with the backend.");
              }

              // Notify the user and admin via email (handled in backend)
              const result = await res.json();

              if (result.success) {
                handlePaymentSuccess(courseId, emiNumber, amount, response.razorpay_payment_id);
                alert("Payment successful! Emails have been sent.");
              } else {
                throw new Error(result.message || "Failed to send emails.");
              }
            } catch (err) {
              alert("Payment was successful, but there was an issue processing the response.");
            }
            finally {
              setIsLoading(false);
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
          },
          theme: { color: "#F37254" },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      alert("Payment failed. Check Contact for details.");
    }
  };

  const handlePaymentSuccess = async (courseId, emiNumber, amount, paymentId) => {
    try {
      await addDoc(collection(db, "payments"), {
        userId: userEmail,
        courseId,
        amount: Number(amount),
        status: "paid",
        timestamp: new Date(),
        paymentId,
      });

      alert(`Payment for EMI #${emiNumber} successful!`);
      closePaymentModal();
    } catch (error) {
      alert("Failed to record payment. Please try again.");
    }
  };

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserEmail(currentUser.email);

        const fetchProfile = async () => {
          const userDocRef = doc(db, "students", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData({
              profilePic: userData.profilePic || "",
              fullName: userData.fullName || "NA",
              fathersName: userData.fathersName || "NA",
              mothersName: userData.mothersName || "NA",
              dob: userData.dob || "NA",
              email: currentUser.email || "NA",
            });
          }
        };

        fetchProfile();
      } else {
        setUser(null);
        setUserEmail(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    const paymentsQueryRef = query(
      collection(db, "payments"),
      where("userId", "==", userEmail)
    );

    const paymentsUnsubscribe = onSnapshot(paymentsQueryRef, (snapshot) => {
      const userPayments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPayments(userPayments);
    });

    return () => paymentsUnsubscribe();
  }, [userEmail]);

  useEffect(() => {
    if (payments.length === 0) return;

    const plansUnsubscribe = onSnapshot(collection(db, "emiPlans"), (snapshot) => {
      const allEmiPlans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEmiPlans(allEmiPlans);
    });

    return () => plansUnsubscribe();
  }, [payments]);

  useEffect(() => {
    if (payments.length === 0 || emiPlans.length === 0) return;

    const updatedSchedules = {};

    payments.forEach((payment) => {
      const { courseId, amount } = payment;
      const relevantPlan = emiPlans.find(
        (plan) => plan.courseId === courseId && Number(plan.amount) === Number(amount)
      );

      if (!relevantPlan) return;

      const totalEMIs = parseInt(relevantPlan.duration || 0, 10);
      const sortedPayments = payments
        .filter((p) => p.courseId === courseId)
        .sort((a, b) => {
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
          amount: relevantPlan.amount,
          status: i < sortedPayments.length ? "paid" : "unpaid",
        });
      }

      updatedSchedules[courseId] = schedule;
    });

    setEmiSchedules(updatedSchedules);
    setLoading(false);
  }, [payments, emiPlans]);


  return (
    <div className="flex flex-col md:flex-row h-screen min-h-screen">
      <aside
        className={`w-full md:w-64 bg-red-600 text-white p-4 shadow-lg transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative h-full z-10`}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-2xl font-bold"
          >
            ✖
          </button>
        </div>
        <div className="p-6 flex flex-col items-center">
          <img
            src={formData.profilePic || "https://via.placeholder.com/100"}
            alt="Profile"
            className="rounded-full mb-4 w-24 h-24 object-cover"
          />
          <h2 className="text-lg font-bold">{user?.displayName || "User"}</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link
                to="/profile"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                Enrolled Courses
              </Link>
            </li>
            <li>
              <Link
                to="/courses"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                Add Courses
              </Link>
            </li>
            <li>
              <Link
                to="/finalize"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                Payments
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto bg-white shadow rounded border border-red-200 text-gray-800">
        <h2 className="text-2xl font-bold mb-4 text-red-600">
          EMI Details for {userEmail}
        </h2>

        {/* Show message if user is not enrolled in any EMI plans */}
        {Object.keys(emiSchedules).length === 0 ? (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">
              You are not enrolled in any EMI plans.
            </h3>
            <p className="text-gray-600 mt-2">
              Explore available courses with EMI options and start your journey today.
            </p>
            <Link to="/courses">
              <button className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Browse Courses with EMI Plans
              </button>
            </Link>
          </div>
        ) : (
          Object.keys(emiSchedules).map((courseId) => {
            const schedule = emiSchedules[courseId] || [];
            const unpaidEMIs = schedule.filter((emi) => emi.status === "unpaid");
            const totalUnpaid = unpaidEMIs.reduce(
              (sum, emi) => sum + Number(emi.amount),
              0
            );

            return (
              <div key={courseId} className="mb-8 border border-red-100 rounded p-4">
                <h3 className="text-lg font-semibold mb-2 text-red-600">
                  Course: {courseId}
                </h3>
                <ul>
                  {schedule.map((emi, idx) => (
                    <li key={idx} className="flex justify-between items-center mb-2">
                      <span>
                        EMI #{emi.emiNumber} — Due on {emi.date.toLocaleDateString("en-IN")} — ₹
                        {Number(emi.amount).toLocaleString("en-IN")}
                      </span>
                      {emi.status === "paid" ? (
                        <span className="bg-green-500 text-white px-4 py-1 rounded">
                          Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => openPaymentModal(courseId, emi.emiNumber, emi.amount)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                        >
                          Pay
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}

        <PaymentModal />
      </div>

    </div>
  );
};

export default EMIDetails;







