
import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, updateDoc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { isValidPhoneNumber } from "libphonenumber-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import countryData from "./Countrycode.json";
import Select from "react-select";
import PhoneInput from "./PhoneInput"; // Import the component
import { parsePhoneNumberFromString } from "libphonenumber-js";
import InquiryHandler from "./Inquiryhandler"; // Import the new component
import PaymentGuide from "./PaymentGuide";




const Enrollment = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    course: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [usd, setUsd] = useState()
  const [currentUser, setCurrentUser] = useState()
  const [isLoading, setIsLoading] = useState(false); // Loading state for async operations

  const [countryCode, setCountryCode] = useState("+91"); // Default India
  const [countryList, setCountryList] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("+91"); // Default India


  const { courseId, courseType } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const sortedCountries = countryData.sort((a, b) =>
    a.name.localeCompare(b.name)
  );


  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;


  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const codes = data.map((country) => ({
          name: country.name.common,
          code: country.idd?.root + (country.idd?.suffixes ? country.idd.suffixes[0] : ""),
        })).filter((c) => c.code);

        setCountryList(codes);
      } catch (error) {
        console.error("Error fetching country codes:", error);
      }
    };

    fetchCountryCodes();
  }, []);



  const handlePhoneChange = (e) => {
    let inputPhone = e.target.value;
    const phoneNumber = parsePhoneNumberFromString(inputPhone, selectedCountry);
    if (phoneNumber && phoneNumber.isValid()) {
      setFormData({ ...formData, phone: phoneNumber.number });
    } else {
      setFormData({ ...formData, phone: inputPhone }); // Allow partial entry
    }
  };


  useEffect(() => {
    if (courseId && courseType) {
      setFormData((prev) => ({
        ...prev,
        course: courseId, // ✅ Auto-set the course ID
      }));
    }
  }, [courseId, courseType]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);


  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.email);
        setFormData((prev) => ({ ...prev, email: user.email }));
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const paidCoursesCollection = collection(db, "paidCourses");
        const paidCoursesSnapshot = await getDocs(paidCoursesCollection);
        const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(paidCourses);
      } catch (error) {
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { name, email, phone, course } = formData;
    if (!name || !email || !phone || !course) {
      return "All fields are required!";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Invalid email address!";
    }

    return "";
  };

  const updateFirebaseSubscription = async (formData) => {
    const subscriptionDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(subscriptionDate.getFullYear() + 1);

    try {
      const subscriptionRef = doc(db, "subscriptions", formData.email.trim());
      const subscriptionSnap = await getDoc(subscriptionRef);

      if (subscriptionSnap.exists()) {
        const currentData = subscriptionSnap.data();
        const updatedCourses = currentData.DETAILS || [];

        const courseExists = updatedCourses.some((course) => course[formData.course]);
        if (!courseExists) {
          updatedCourses.push({
            [formData.course]: {
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
              [formData.course]: {
                subscriptionDate: subscriptionDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                status: "active",
              },
            },
          ],
        });
      }

    } catch (error) {
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!recaptchaValue) {
      setErrorMessage("Please complete the reCAPTCHA!");
      alert("Please Complete Recaptcha")
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    try {
      // Fetch exchange rate
      const exchangeRateResponse = await fetch(
        "https://api.exchangerate-api.com/v4/latest/INR"
      );
      const exchangeRateData = await exchangeRateResponse.json(); // Correctly parse JSON
      const exchangeRate = exchangeRateData.rates.USD;

      // Find the selected course
      const selectedCourse = courses.find(
        (course) => course.id === formData.course
      );

      if (!selectedCourse) {
        setErrorMessage("Selected course not found. Please select a valid course.");
        return null;
      }

      // Convert course price to USD
      const priceInUSD = (selectedCourse.price * exchangeRate).toFixed(2);
      setUsd(priceInUSD)

    }
    catch (error) {

    }

    setErrorMessage("");
    setSuccessMessage(" Proceed with payment.");


  };

  const handleRazorpay = async () => {
    setIsLoading(true); // Start loading
    try {
      const selectedCourse = courses.find((course) => course.id === formData.course);
      if (!selectedCourse) {
        setErrorMessage("Selected course not found. Please select a valid course.");
        setIsLoading(false);
        return;
      }

      const amountInPaise = selectedCourse.price * 100;

      // Create Razorpay order
      const orderResponse = await fetch("https://backend-7e8f.onrender.com/api/payment/razorpay/order", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedCourse.price }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create Razorpay order.");
      }

      const { orderId } = await orderResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: amountInPaise,
        currency: "INR",
        name: "Astrology Course",
        description: "Enroll in our course",
        order_id: orderId,
        handler: async (response) => {
          const transactionId = response.razorpay_payment_id; // Razorpay payment ID
          const { razorpay_order_id, razorpay_signature } = response;

          try {
            // Verify payment on backend
            const backendResponse = await fetch("https://backend-7e8f.onrender.com/api/payment/razorpay/success", {

            
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: transactionId,
                orderId: razorpay_order_id,
                signature: razorpay_signature,
                userDetails: formData,
                courseId: selectedCourse.id,
                amount: amountInPaise,
              }),
            });

            if (!backendResponse.ok) {
              throw new Error("Payment verification failed.");
            }

            // Save payment details to Firebase
            try {
              await addDoc(collection(db, "payments"), {
                userId: currentUser,
                courseId: selectedCourse.id,
                
                amount: selectedCourse.price,
                transactionId,
                status: "paid",
                timestamp: new Date(),
              });
            } catch (firebaseError) {
              console.error("Error saving payment:");
            }

            // Update subscription in Firebase
            try {
              await updateFirebaseSubscription(formData);
            } catch (subscriptionError) {
              console.error("Error updating subscription:");
            }

            alert("Payment successful");

            setSuccessMessage("Payment successful! Redirecting...");
            navigate("/dashboard", { replace: true });
          } catch (error) {
            setErrorMessage("Payment verification failed. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#FF6347" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        setErrorMessage("Payment failed. Please try again.");
        setIsLoading(false);
      });

      rzp.open();
    } catch (error) {
      setErrorMessage("Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };




  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-white to-orange-100 py-16">

      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-white border border-red-600 rounded-xl shadow-lg max-w-lg w-full p-8">
          <h1 className="text-3xl font-bold text-center text-red-600">Enroll in a Course</h1>
          <p className="text-center text-red-500 mb-6">
            Join our course and explore the wonders of astrology.
          </p>

          {errorMessage && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && <InquiryHandler formData={formData} />}

            <div>
              <label className="block text-red-600 font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full border border-red-300 rounded px-3 py-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-red-600 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border border-red-300 rounded px-3 py-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-red-600 font-medium">Country Code</label>
              <PhoneInput selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />
              <label className="block text-red-600 font-medium pt-[10px]">Phone Number</label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-600"
                // placeholder={`Enter phone number (${selectedCountry})`}
                placeholder="Enter Phone Number"
                required
              />
            </div>


            <div>
              <label className="block text-red-600 font-medium">Course</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                disabled //  Prevents changing course since it's already selected
                className="w-full border border-red-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              >
                {courses
                  .filter((course) => course.id === formData.course) //  Show only the selected course
                  .map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} - ₹{course.price}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-red-600 font-medium">Price</label>
              <input
                type="text"
                name="price"
                value={
                  courses.find((course) => course.id === formData.course)?.price
                    ? `₹${courses.find((course) => course.id === formData.course).price}`
                    : "Loading..."
                }
                readOnly //  Prevents manual editing
                className="w-full border border-red-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>


            <div className="flex justify-center mt-4">
              <ReCAPTCHA
                sitekey={recaptchaSiteKey}
                onChange={(value) => setRecaptchaValue(value)}
              />
            </div>


            <button
              type="submit"
              className="w-full bg-red-600 text-white font-medium py-2 rounded hover:bg-red-700 focus:ring-red-500 focus:outline-none"
            >
              Proceed to Payment
            </button>
          </form>

          {successMessage && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-red-600 text-center">Make Payment</h2>
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleRazorpay}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 focus:ring-red-500 focus:outline-none flex justify-center items-center"
                  disabled={isLoading} // Disable button when loading
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
                {/* <div className="mt-4">{handlePayPal()}</div> */}


                <div className="mt-4">
                  <button
                    onClick={async () => {
                      const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

                      if (!PAYPAL_CLIENT_ID) {
                        alert("PayPal Client ID is missing. Please set it in the .env file.");
                        return;
                      }

                      const paypalScriptUrl = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;

                      try {
                        // Dynamically load PayPal script
                        await new Promise((resolve, reject) => {
                          const script = document.createElement("script");
                          script.src = paypalScriptUrl;
                          script.onload = resolve;
                          script.onerror = reject;
                          document.body.appendChild(script);
                        });

                        // Get the selected course
                        const selectedCourse = courses.find((course) => course.id === formData.course);
                        if (!selectedCourse) {
                          alert("Selected course not found. Please select a valid course.");
                          return;
                        }

                        // Render PayPal button
                        window.paypal
                          .Buttons({
                            createOrder: (data, actions) => {
                              const priceInUSD = usd; // Payment amount in USD
                              if (!priceInUSD) {
                                throw new Error("Payment amount not set. Please try again.");
                              }
                              return actions.order.create({
                                purchase_units: [
                                  {
                                    amount: {
                                      value: priceInUSD,
                                    },
                                  },
                                ],
                              });
                            },
                            onApprove: async (data, actions) => {
                              try {
                                const details = await actions.order.capture();
                                alert(`Transaction completed by ${details.payer.name.given_name}`);

                                // Call the backend to process payment
                                const backendResponse = await fetch(
                                  "https://backend-7e8f.onrender.com/api/payment/paypal/success",
                                  {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      paymentId: details.id,
                                      userDetails: formData,
                                      courseId: selectedCourse.id,
                                      amount: selectedCourse.price,
                                    }),
                                  }
                                );

                                if (!backendResponse.ok) {
                                  const errorData = await backendResponse.json();
                                  alert(`Payment processed but failed on the server: ${errorData.error}`);
                                  return;
                                }


                                // Save payment details to Firebase
                                await addDoc(collection(db, "payments"), {
                                  userId: currentUser,
                                  courseId: selectedCourse.id,
                                  amount: selectedCourse.price,
                                  transactionId: details.id,
                                  status: "paid",
                                  timestamp: new Date(),
                                });

                                // Update subscription in Firebase
                                await updateFirebaseSubscription(formData);

                                // Navigate to dashboard
                                navigate("/dashboard");
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
                          .render("#paypal-button-container");
                      } catch (error) {
                        alert("An error occurred while initializing PayPal. Please try again.");
                      }
                    }}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 focus:ring-red-500 focus:outline-none"
                  >
                    Pay with PayPal
                  </button>
                  {/* Placeholder for dynamically rendered PayPal button */}
                  <div id="paypal-button-container" className="mt-4"></div>

                  <div className="mt-4 space-y-2">
                    <Link
                      to="/payemi"
                      state={{
                        name: formData.name,
                        email: formData.email,
                        phone: `${selectedCountry} ${formData.phone}`,  // Include country code
                        courseId: formData.course
                      }}>
                      <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 focus:ring-red-500 focus:outline-none">
                        Pay with Installment
                      </button>
                    </Link>

                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <div className=" left-0 bottom-0 " >
      <PaymentGuide  />
      </div>
    </div>
    
  );
};

export default Enrollment;

