
import React, { useState } from "react";
import { collection, addDoc, getFirestore, serverTimestamp } from "firebase/firestore";


const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const db = getFirestore(); // Initialize Firestore


  const [isSent, setIsSent] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 
const handleSubmit = async (e) => {
  e.preventDefault();
  const formEndpoint = "https://api.web3forms.com/submit";
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  const data = {
    access_key: accessKey,
    ...formData,
  };

  try {
    // ✅ Store Contact Inquiry in Firestore
    await addDoc(collection(db, "Astro_Contact"), {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      timestamp: serverTimestamp(), // Store time of submission
    });

    // ✅ Send form data to Web3Forms for email notification
    const response = await fetch(formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setIsSent(true);
      alert("Message Sent Successfully");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } else {
      setIsError(true);
    }
  } catch (error) {
    console.error("Form submission error:", error);
    setIsError(true);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-white to-orange-100 py-16">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Section - Map and Contact Details */}
        <div className="bg-red-500 text-white p-8 rounded-lg order-2 lg:order-1">
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p className="mt-2 text-xl font-semibold text-orange-200">
            Vahlay Astro
          </p>
          <p className="mt-2">Email: contact@vahlayastro.com</p>
          <p className="mt-2">LandLine: +91 79 4921 7538</p>
          <h2 className="text-2xl font-bold mt-6">Locations</h2>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d14688.319785350497!2d72.50865080000001!3d23.020836649999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1733871592043!5m2!1sen!2sin"
            className="w-full h-48 mt-4 rounded-lg"
            allowFullScreen=""
            loading="lazy"
            title="Google Map"
          ></iframe>
          <p className="mt-4">
            C 515, Dev Aurum Commercial Complex, Prahlad Nagar, Ahmedabad,
            Gujarat <br />
            380015
          </p>
        </div>

        {/* Right Section - Contact Form */}
        <div className="bg-white shadow-lg rounded-lg p-8 lg:p-12 order-1 lg:order-2">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Get in Touch
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Feel free to drop us a line below!
          </p>
          {isSent && (
            <p className="text-center text-green-500 mb-4">
              Your message has been sent. Thank you!
            </p>
          )}
          {isError && (
            <p className="text-center text-red-500 mb-4">
              Something went wrong. Please try again.
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 lg:py-2 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 lg:py-2 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 lg:py-2 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 lg:py-2 h-28 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-red-600 text-white font-bold py-2 px-6 rounded-full hover:bg-red-700 transition"
                >
                  SEND
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

