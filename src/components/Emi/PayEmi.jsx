import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButtonWrapper = ({ amountInUSD, formData, selectedPlan, onSuccess, onError, onCancel }) => (
  <PayPalScriptProvider
    options={{
      "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
      currency: "USD",
    }}
  >
    <PayPalButtons
      style={{ layout: "horizontal" }}
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amountInUSD,
              },
            },
          ],
        });
      }}
      onApprove={async (data, actions) => {
        try {
          const details = await actions.order.capture();
          onSuccess(details);
        } catch (error) {
          onError(error);
        }
      }}
      onCancel={onCancel}
      onError={onError}
    />
  </PayPalScriptProvider>
);




const UserEmi = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [emiPlans, setEmiPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [showPayPalButtons, setShowPayPalButtons] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.email);
        setFormData((prev) => ({ ...prev, email: user.email }));

        const userCoursesQuery = query(
          collection(db, "subscriptions"),
          where("email", "==", user.email)
        );

        const unsubscribeCourses = onSnapshot(userCoursesQuery, (snapshot) => {
          if (!snapshot.empty) {
            const userCourses = snapshot.docs[0].data().DETAILS || [];
            setCourses(userCourses.map((course) => Object.keys(course)[0]));
          }
        });

        return () => unsubscribeCourses();
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribeCourses = onSnapshot(collection(db, "paidCourses"), (snapshot) => {
      setCourses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setEmiPlans([]);
      return;
    }

    const unsubscribePlans = onSnapshot(
      query(collection(db, "emiPlans"), where("courseId", "==", selectedCourse)),
      (snapshot) => {
        setEmiPlans(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => unsubscribePlans();
  }, [selectedCourse]);

  const updateFirebaseSubscription = async () => {
    const subscriptionDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(subscriptionDate.getFullYear() + 1);

    try {
      const subscriptionRef = doc(db, "subscriptions", formData.email.trim());
      const subscriptionSnap = await getDoc(subscriptionRef);

      if (subscriptionSnap.exists()) {
        const currentData = subscriptionSnap.data();
        const updatedCourses = currentData.DETAILS || [];

        const courseExists = updatedCourses.some(
          (course) => course[selectedCourse]
        );
        if (!courseExists) {
          updatedCourses.push({
            [selectedCourse]: {
              subscriptionDate: subscriptionDate.toISOString(),
              expiryDate: expiryDate.toISOString(),
              status: "active",
            },
          });

          await updateDoc(subscriptionRef, { DETAILS: updatedCourses });
        }
      } else {
        await setDoc(subscriptionRef, {
          DETAILS: [
            {
              [selectedCourse]: {
                subscriptionDate: subscriptionDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                status: "active",
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error:");
    }
  };



  const handleRazorpayPayment = async () => {
   
    setIsLoading(true); 

    if (!selectedPlan) {
      setErrorMessage("Please select an EMI plan before proceeding.");
      return;
    }

    try {
      const amountInPaise = selectedPlan.amount * 100;

      // Step 1: Create an order in the backend
      const orderResponse = await fetch("https://backend-7e8f.onrender.com/api/emi/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedPlan.amount }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create Razorpay order.");
      }

      const { orderId } = await orderResponse.json();

      // Step 2: Ensure Razorpay SDK is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded. Please refresh the page and try again.");
      }

      // Step 3: Configure Razorpay options
      const options = {
        key: RAZORPAY_KEY, // Replace with your Razorpay API key
        amount: amountInPaise,
        currency: "INR",
        name: "EMI Payment",
        description: `Pay EMI for duration: ${selectedPlan.duration}`,
        order_id: orderId,
        handler: async (response) => {
          try {

            // Step 4: Send payment details to the backend for verification
            const backendResponse = await fetch("https://backend-7e8f.onrender.com/api/emi/razorpay/success", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id || orderId,
                signature: response.razorpay_signature,
                userDetails: formData,
                planId: selectedPlan.id,
                amount: selectedPlan.amount,
              }),
            });

            if (backendResponse.ok) {
              const transactionId = response.razorpay_payment_id;

              // Step 5: Update Firebase with payment details
              await addDoc(collection(db, "payments"), {
                userId: currentUser, // Assuming currentUser is retrieved from your auth context
                planId: selectedPlan.id,
                courseId: selectedCourse, // Assuming this is defined in your logic
                amount: selectedPlan.amount,
                transactionId,
                status: "paid",
                timestamp: new Date(),
              });

              // Step 6: Update subscription logic in Firebase
              await updateFirebaseSubscription(); // Replace with your actual subscription update function

              // Step 7: Navigate to the dashboard or show success
              setPaymentStatus("success");
              alert("Payment successful! Thank you.");
              navigate("/dashboard");
            } else {
              // Handle backend verification failure
              const errorData = await backendResponse.json();
              alert(`Payment verification failed: ${errorData.error || "Unknown error"}. Please contact support.`);
            }
          } catch (error) {
            alert("Payment verification failed due to a network or server error. Please contact support.");
          }
          finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#F37254" },
      };

      // Step 8: Open Razorpay payment popup
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setErrorMessage(error.message || "Payment failed. Please try again.");
    }
  };




  // convert ruppess into dollar 



  const fetchUSDConversionRate = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR"); // Replace with your preferred API
      const data = await response.json();
      return data.rates.USD || 0; // Return the USD rate
    } catch (error) {
      return 0; // Default to 0 on error
    }
  };





  const handlePayPalPayment = async () => {
    if (!selectedPlan) {
      setErrorMessage("Please select an EMI plan before proceeding.");
      return;
    }

    try {
      const conversionRate = await fetchUSDConversionRate();
      const amountInUSD = (selectedPlan.amount * conversionRate).toFixed(2); // Convert INR to USD

      const orderResponse = await fetch("https://backend-7e8f.onrender.com/api/emi/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInUSD }), // Send USD amount
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create PayPal order.");
      }

      setFormData((prevData) => ({ ...prevData, amountInUSD }));
      setShowPayPalButtons(true);
    } catch (error) {
      setErrorMessage("Failed to initialize PayPal. Please try again.");
    }
  };


  return (
    <div className="m-auto my-20 min-h-screen">
      <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded border border-red-200">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Apply For Emi</h2>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-600"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Email</label>
          <input
            type="text"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-600"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Phone</label>
          <input
            type="number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-600"
            placeholder="Enter your phone number"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Select a Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-600"
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.id}
              </option>
            ))}
          </select>
        </div>
        {selectedCourse && (
          <>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Available EMI Plans</h3>
            <div className="space-y-4">
              {emiPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded shadow cursor-pointer transition-colors duration-200 ${selectedPlan?.id === plan.id
                    ? "bg-orange-200 border border-red-300"
                    : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <h4 className="font-semibold text-gray-700">{plan.duration} Months</h4>
                  <p className="text-gray-600">Amount: ₹{plan.amount} /Per Month</p>
                </div>
              ))}
            </div>
          </>
        )}
        <button
          onClick={handleRazorpayPayment}
          disabled={!selectedPlan || !formData.name || !formData.phone }
          className={`mt-4 w-full py-2 px-4 rounded transition-colors duration-200 ${selectedPlan && formData.name && formData.phone
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-gray-400 text-white cursor-not-allowed"
            }`}
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
        <div className="mt-4">
          <button
            onClick={async () => {
              const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

              if (!PAYPAL_CLIENT_ID) {
                alert("PayPal Client ID is missing. Please set it in the .env file.");
                return;
              }

              try {
                // Fetch USD conversion rate and calculate the amounts
                const conversionRate = await fetchUSDConversionRate();
                const amountInUSD = (selectedPlan.amount * conversionRate).toFixed(2);

                if (!amountInUSD || amountInUSD <= 0) {
                  alert("Invalid amount for payment. Please try again.");
                  return;
                }

                const paypalScriptUrl = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;

                // Dynamically load PayPal SDK
                await new Promise((resolve, reject) => {
                  const script = document.createElement("script");
                  script.src = paypalScriptUrl;
                  script.onload = resolve;
                  script.onerror = reject;
                  document.body.appendChild(script);
                });

                // Render PayPal Buttons
                window.paypal
                  .Buttons({
                    createOrder: (data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              currency_code: "USD",
                              value: amountInUSD, // Payment amount in USD
                            },
                          },
                        ],
                      });
                    },
                    onApprove: async (data, actions) => {
                      try {
                        const details = await actions.order.capture(); // Capture PayPal order
                        const transactionId = details.id; // Extract transaction ID
                        const payerName = details.payer.name.given_name;

                        alert(`Transaction completed by ${payerName}`);

                        // Backend call to verify payment and send emails
                        const backendResponse = await fetch("https://backend-7e8f.onrender.com/api/emi/paypal/success", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            paymentId: details.id, // PayPal transaction ID
                            userDetails: formData, // User data
                            courseId: selectedCourse, // Selected course ID
                            amount: selectedPlan.amount // Plan amount in INR
                          }),
                        });

                        if (backendResponse.ok) {

                          // Update Firebase with payment details
                          await addDoc(collection(db, "payments"), {
                            userId: currentUser,
                            courseId: selectedCourse,
                            planId: selectedPlan.id,
                            amount: selectedPlan.amount,
                            transactionId,
                            status: "paid",
                            timestamp: new Date(),
                          });


                          // Update subscriptions in Firebase
                          await updateFirebaseSubscription();

                          alert("Payment successful! Thank you.");
                          navigate("/dashboard");
                        } else {
                          const errorData = await backendResponse.json();
                          alert(`Payment verification failed: ${errorData.error || "Unknown error"}.`);
                        }
                      } catch (error) {
                        alert("An error occurred during the payment process. Please try again.");
                      }
                    },


                    onCancel: () => {
                      alert("Payment was cancelled. Please try again.");
                    },
                    onError: (err) => {
                      alert("An error occurred during the payment process. Please try again.");
                    },
                  })
                  .render("#paypal-button-container"); // Render PayPal buttons dynamically
              } catch (error) {
                alert("An error occurred while initializing PayPal. Please try again.");
              }
            }}
            disabled={!selectedPlan || !formData.name || !formData.phone}
            className={`mt-4 w-full py-2 px-4 rounded transition-colors duration-200 ${selectedPlan && formData.name && formData.phone
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-400 text-white cursor-not-allowed"
              }`}
          >
            Pay with PayPal
          </button>

          {/* Placeholder for dynamically rendered PayPal button */}
          <div id="paypal-button-container" className="mt-4"></div>
        </div>
      </div>
    </div>
  );
};

export default UserEmi;







