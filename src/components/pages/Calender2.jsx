import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, collection, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig"; // Firebase configuration file

const db = getFirestore(app);

const NewUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "",
    availableDate: "",
    slot: "",
  });

  const [availableData, setAvailableData] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCalendarData = async () => {
      const calendarSnapshot = await getDocs(collection(db, "calendar"));
      const appointmentsSnapshot = await getDocs(collection(db, "appointments"));

      const availableDates = {};
      const bookedSlots = {};

      // Fetch available slots
      calendarSnapshot.forEach((doc) => {
        availableDates[doc.id] = doc.data().slots;
      });

      // Fetch booked slots
      appointmentsSnapshot.forEach((doc) => {
        const { availableDate, slot } = doc.data();
        if (!bookedSlots[availableDate]) {
          bookedSlots[availableDate] = [];
        }
        bookedSlots[availableDate].push(slot);
      });

      // Calculate available data
      const availableDataList = Object.entries(availableDates).map(([date, slots]) => {
        const booked = bookedSlots[date] || [];
        const availableSlots = slots.filter((slot) => !booked.includes(slot));
        return { date, slots: availableSlots };
      });

      setAvailableData(availableDataList);
    };

    fetchCalendarData();
  }, []);

  const handleSlotSelection = (date, slot) => {
    setFormData((prev) => ({ ...prev, availableDate: date, slot }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.availableDate || !formData.slot) {
      setErrors({ submit: "Please select a date and time slot." });
      return;
    }

    try {
      const appointmentRef = collection(db, "appointments");

      // Add appointment details
      await setDoc(doc(appointmentRef, `${formData.availableDate}-${formData.slot}`), {
        ...formData,
      });

      alert("Appointment booked successfully!");
      navigate("/submission-success");
    } catch (error) {
      console.error("Error booking appointment:", error);
      setErrors({ submit: "Failed to book appointment. Try again later." });
    }
  };

  return (
    <div className="min-h-screen bg-red-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">
          Book an Appointment
        </h1>

        {availableData.length > 0 ? (
          <div className="mb-6">
            {availableData.map(({ date, slots }) => (
              <div key={date} className="mb-4">
                <h2 className="text-lg font-medium text-gray-700 mb-2">{date}</h2>
                <div className="grid grid-cols-3 gap-4">
                  {slots.length > 0 ? (
                    slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleSlotSelection(date, slot)}
                        className={`p-2 border rounded ${
                          formData.availableDate === date && formData.slot === slot
                            ? "bg-red-600 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        {slot}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500">No slots available</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">Loading available dates and slots...</p>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset className="border border-red-300 rounded-lg p-6 mb-6">
            <legend className="text-lg font-semibold text-red-500 px-2">Contact Details</legend>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Add other fields for firstName, lastName, phone, etc. */}
          </fieldset>

          <button
            type="submit"
            className="bg-red-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-red-700 transition-all"
          >
            Submit
          </button>
          {errors.submit && (
            <p className="mt-4 text-red-500 text-center font-semibold">
              {errors.submit}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewUser;
