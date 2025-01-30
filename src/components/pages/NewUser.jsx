import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebaseConfig";

const db = getFirestore(app);
const auth = getAuth(app);

const NewUser = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: { day: "", month: "", year: "" },
    birthTime: { hour: "", minute: "", period: "AM" },
    birthPlace: "",
    email: "",
    phone: "",
    countryCode: "",
    availableDate: "",
    
    slot: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [availableData, setAvailableData] = useState([]);
  const navigate = useNavigate();

  // Redirect unauthenticated users to the login page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/signup");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch available data for the calendar
  useEffect(() => {
    const fetchAvailableData = async () => {
      try {
        const calendarSnapshot = await getDocs(collection(db, "Calendar"));
        const groupedData = calendarSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          acc[data.date] = acc[data.date] || [];
          acc[data.date].push(data.timeSlot);
          return acc;
        }, {});
        const availableDataList = Object.entries(groupedData).map(([date, timeSlots]) => ({
          date,
          timeSlot: timeSlots,
        }));
        setAvailableData(availableDataList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchAvailableData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const keys = name.split("."); // Split for nested fields like dob.day
      if (keys.length > 1) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const validationErrors = {};

    if (formData.dob.day < 1 || formData.dob.day > 31) {
      validationErrors["dob.day"] = "Day must be between 1 and 31.";
    }
    if (formData.dob.month < 1 || formData.dob.month > 12) {
      validationErrors["dob.month"] = "Month must be between 1 and 12.";
    }
    if (!formData.dob.year || formData.dob.year.length !== 4) {
      validationErrors["dob.year"] = "Please enter a valid 4-digit year.";
    }
    if (formData.birthTime.hour < 1 || formData.birthTime.hour > 12) {
      validationErrors["birthTime.hour"] = "Hour must be between 1 and 12.";
    }
    if (formData.birthTime.minute < 0 || formData.birthTime.minute > 59) {
      validationErrors["birthTime.minute"] = "Minutes must be between 0 and 59.";
    }
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      validationErrors["email"] = "Invalid email address.";
    }
    if (!/^\d{7,15}$/.test(formData.phone)) {
      validationErrors["phone"] = "Phone number must be between 7 and 15 digits.";
    }
    if (!/^\+\d{1,4}$/.test(formData.countryCode)) {
      validationErrors["countryCode"] = "Invalid country code (e.g., +91).";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
  
    try {
      const formEndpoint = "https://api.web3forms.com/submit";
      const accessKey = "afc0705d-3423-48a7-a14d-e83d4ffd11e0"; // Replace with your actual W3Forms access key
  
      // Format dob and birthTime as strings
      const formattedData = {
        ...formData,
        dob: `${formData.dob.day}-${formData.dob.month}-${formData.dob.year}`, // e.g., "01-01-2000"
        birthTime: `${formData.birthTime.hour}:${formData.birthTime.minute} ${formData.birthTime.period}`, // e.g., "10:30 AM"
      };
  
      const data = {
        access_key: accessKey,
        ...formattedData,
      };
  
      const response = await fetch(formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        setSuccess("Form submitted successfully! You will receive an email confirmation.");
        setFormData({
          firstName: "",
          lastName: "",
          gender: "",
          dob: { day: "", month: "", year: "" },
          birthTime: { hour: "", minute: "", period: "AM" },
          birthPlace: "",
          email: "",
          phone: "",
          countryCode: "",
          availableDate: "",
          slot: "",
        });
      } else {
        throw new Error("Failed to submit the form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Failed to submit the form. Please try again later." });
    }
  };
  

  return (
    <div className="min-h-screen bg-red-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">
          Book an Appointment
        </h1>
        <form onSubmit={handleSubmit}>
          {/* Add form fields */}
          {/* Form fields here as previously defined */}
           {/* Form fields... */}


           <fieldset className="border border-red-300 rounded-lg p-6 mb-6">
            <legend className="text-lg font-semibold text-red-500 px-2">Personal Details</legend>

            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Gender</label>
              <div className="flex space-x-4">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Female
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Other"
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Other
                </label>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Day</label>
                <input
                  type="number"
                  name="dob.day"
                  value={formData.dob.day}
                  onChange={handleChange}
                  placeholder="DD"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                />
                {errors["dob.day"] && <p className="text-red-500 text-sm">{errors["dob.day"]}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Month</label>
                <input
                  type="number"
                  name="dob.month"
                  value={formData.dob.month}
                  onChange={handleChange}
                  placeholder="MM"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                />
                {errors["dob.month"] && <p className="text-red-500 text-sm">{errors["dob.month"]}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Year</label>
                <input
                  type="number"
                  name="dob.year"
                  value={formData.dob.year}
                  onChange={handleChange}
                  placeholder="YYYY"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                />
                {errors["dob.year"] && <p className="text-red-500 text-sm">{errors["dob.year"]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Hour</label>
                <input
                  type="number"
                  name="birthTime.hour"
                  value={formData.birthTime.hour}
                  onChange={handleChange}
                  placeholder="HH"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                />
                {errors["birthTime.hour"] && <p className="text-red-500 text-sm">{errors["birthTime.hour"]}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Minute</label>
                <input
                  type="number"
                  name="birthTime.minute"
                  value={formData.birthTime.minute}
                  onChange={handleChange}
                  placeholder="MM"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                />
                {errors["birthTime.minute"] && (
                  <p className="text-red-500 text-sm">{errors["birthTime.minute"]}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">AM/PM</label>
                <select
                  name="birthTime.period"
                  value={formData.birthTime.period}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>




            {/* Birth Place */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Birth Place</label>
              <input
                type="text"
                name="birthPlace"
                value={formData.birthPlace}
                onChange={handleChange}
                placeholder="Enter your birth place"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          </fieldset>

          {/* Contact Details Fieldset */}
          <fieldset className="border border-red-300 rounded-lg p-6 mb-6">
            <legend className="text-lg font-semibold text-red-500 px-2">Contact Details</legend>

            {/* Country Code and Phone */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Country Code</label>
                <input
                  type="text"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  placeholder="+91"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
                {errors["countryCode"] && (
                  <p className="text-red-500 text-sm">{errors["countryCode"]}</p>
                )}
              </div>
              <div >
                <label className="block text-gray-700 font-medium mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                />
                {errors["phone"] && <p className="text-red-500 text-sm">{errors["phone"]}</p>}
              </div>
            </div>


            {/* Available Date */}
            <div className="mb-4">
              <fieldset className="border border-red-300 rounded-lg p-6 mb-6">


                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Available Date
                  </label>
                  <select
                    name="availableDate"
                    value={formData.availableDate}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="" disabled>
                      Select a date
                    </option>
                    {availableData.map((item) => (
                      <option key={item.date} value={item.date}>
                        {item.date}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.availableDate && (
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Available Slots
                    </label>
                    <select
                      name="slot"
                      value={formData.slot}
                      onChange={handleChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="" disabled>
                        Select a time slot
                      </option>
                      {availableData
                        .find((item) => item.date === formData.availableDate)
                        ?.timeSlot.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </fieldset>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@example.com"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                required
              />
              {errors["email"] && <p className="text-red-500 text-sm">{errors["email"]}</p>}
            </div>
          </fieldset>
          <button
            type="submit"
            className="bg-red-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-red-700 transition-all"
          >
            Submit
          </button>
        </form>
        {success && <p className="text-green-500 mt-4">{success}</p>}
        {errors.submit && <p className="text-red-500 mt-4">{errors.submit}</p>}
      </div>
    </div>
  );
};

export default NewUser;
