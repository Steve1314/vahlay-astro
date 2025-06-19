import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Authentication
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebaseConfig"; // Firebase configuration file

const db = getFirestore(app);
const auth = getAuth(app);

const OldUserAppointment = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    birthHour: "",
    birthMinute: "",
    birthAMPM: "AM",
    birthPlace: "",
    email: "",
    phone: "",
    consultationDetails: "",
    availableDate: "",
    slot: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [availableData, setAvailableData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchAvailableData = async () => {
      try {
        const calendarSnapshot = await getDocs(collection(db, "Calendar"));

        const groupedData = calendarSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data();
          const date = data.date;
          const timeSlot = data.timeSlot;

          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(timeSlot);

          return acc;
        }, {});

        const availableDataList = Object.entries(groupedData).map(([date, timeSlots]) => ({
          date,
          timeSlot: timeSlots,
        }));

        setAvailableData(availableDataList);
      } catch (error) {
        console.error("Error fetching available data:", error);
      }
    };

    fetchAvailableData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    if (!formData.dobDay || formData.dobDay < 1 || formData.dobDay > 31) {
      newErrors.dobDay = "Invalid Day for Date of Birth";
    }
    if (!formData.dobMonth || formData.dobMonth < 1 || formData.dobMonth > 12) {
      newErrors.dobMonth = "Invalid Month for Date of Birth";
    }
    if (!formData.dobYear || formData.dobYear < 1900 || formData.dobYear > new Date().getFullYear()) {
      newErrors.dobYear = "Invalid Year for Date of Birth";
    }
    if (!formData.phone) newErrors.phone = "Phone Number is required";
    if (!/^\+?\d{10,15}$/.test(formData.phone)) newErrors.phone = "Invalid Phone Number";
    if (!formData.email) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid Email Format";
    if (!formData.consultationDetails) newErrors.consultationDetails = "Consultation Details are required";
    if (!formData.availableDate) newErrors.availableDate = "Available Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formEndpoint = "https://api.web3forms.com/submit";
      const accessKey = "afc0705d-3423-48a7-a14d-e83d4ffd11e0";

      const formattedData = {
        ...formData,
        dob: `${formData.dobDay}-${formData.dobMonth}-${formData.dobYear}`,
        birthTime: `${formData.birthHour}:${formData.birthMinute} ${formData.birthAMPM}`,
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
        setSuccess(alert("Form submitted successfully! You will receive an email confirmation."));
        setFormData({
          firstName: "",
          lastName: "",
          dobDay: "",
          dobMonth: "",
          dobYear: "",
          birthHour: "",
          birthMinute: "",
          birthAMPM: "AM",
          birthPlace: "",
          email: "",
          phone: "",
          consultationDetails: "",
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg min-h-screen">
  <h2 className="text-2xl font-semibold text-center text-gray-800">
    Old User Appointment
  </h2>

  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
    {/* Name Fields */}
    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
      <div className="w-full md:w-1/2">
        <label className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="First Name"
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
        )}
      </div>
      <div className="w-full md:w-1/2">
        <label className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Last Name"
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
        )}
      </div>
    </div>

    {/* Date of Birth Fields */}
    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
      <div className="w-full md:w-1/3">
        <label className="block text-sm font-medium text-gray-700">Day</label>
        <input
          type="number"
          name="dobDay"
          value={formData.dobDay}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="DD"
        />
        {errors.dobDay && (
          <p className="text-red-500 text-sm mt-1">{errors.dobDay}</p>
        )}
      </div>
      <div className="w-full md:w-1/3">
        <label className="block text-sm font-medium text-gray-700">Month</label>
        <input
          type="number"
          name="dobMonth"
          value={formData.dobMonth}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="MM"
        />
        {errors.dobMonth && (
          <p className="text-red-500 text-sm mt-1">{errors.dobMonth}</p>
        )}
      </div>
      <div className="w-full md:w-1/3">
        <label className="block text-sm font-medium text-gray-700">Year</label>
        <input
          type="number"
          name="dobYear"
          value={formData.dobYear}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="YYYY"
        />
        {errors.dobYear && (
          <p className="text-red-500 text-sm mt-1">{errors.dobYear}</p>
        )}
      </div>
    </div>

    {/* Birth Time Fields */}
    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
      <div className="w-full md:w-1/3">
        <label className="block text-sm font-medium text-gray-700">Hour</label>
        <input
          type="number"
          name="birthHour"
          value={formData.birthHour}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="HH"
        />
        {errors.birthHour && (
          <p className="text-red-500 text-sm mt-1">{errors.birthHour}</p>
        )}
      </div>
      <div className="w-full md:w-1/3">
        <label className="block text-sm font-medium text-gray-700">Minute</label>
        <input
          type="number"
          name="birthMinute"
          value={formData.birthMinute}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="MM"
        />
        {errors.birthMinute && (
          <p className="text-red-500 text-sm mt-1">{errors.birthMinute}</p>
        )}
      </div>
      <div className="w-full md:w-1/3">
        <label className="block text-sm font-medium text-gray-700">AM/PM</label>
        <select
          name="birthAMPM"
          value={formData.birthAMPM}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>

    {/* Birth Place */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Birth Place
      </label>
      <input
        type="text"
        name="birthPlace"
        value={formData.birthPlace}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Enter Birth Place"
      />
      {errors.birthPlace && (
        <p className="text-red-500 text-sm mt-1">{errors.birthPlace}</p>
      )}
    </div>

    {/* Phone */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Enter Phone Number"
      />
      {errors.phone && (
        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
      )}
    </div>

    {/* Email */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Enter Email"
      />
      {errors.email && (
        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
      )}
    </div>

    {/* Available Date */}
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

    {/* Consultation Details */}
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Consultation Details
      </label>
      <textarea
        name="consultationDetails"
        value={formData.consultationDetails}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-md"
        placeholder="Enter Consultation Details"
      />
      {errors.consultationDetails && (
        <p className="text-red-500 text-sm mt-1">{errors.consultationDetails}</p>
      )}
    </div>

    {/* Submit Button */}
    <div className="mt-6">
      <button
        type="submit"
        className="w-full py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition"
      >
        Submit Appointment
      </button>
    </div>
  </form>
</div>

  );
};

export default OldUserAppointment;
