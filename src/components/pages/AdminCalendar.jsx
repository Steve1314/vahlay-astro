// AdminCalendar.js (Professionally Styled and Responsive)
import React, { useState, useEffect } from "react";
import Admin from "./Admin";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { Link } from "react-router-dom";

const AdminCalendar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [calendarEntries, setCalendarEntries] = useState([]);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  useEffect(() => {
    fetchCalendarEntries();
  }, []);

  const fetchCalendarEntries = async () => {
    try {
      const data = await getDocs(collection(db, "Calendar"));
      const entries = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCalendarEntries(entries);
    } catch (error) {
      console.error("Error fetching calendar entries:", error);
    }
  };

  const handleAddCalendarEntry = async () => {
    try {
      const newEntry = { date, timeSlot };
      await addDoc(collection(db, "Calendar"), newEntry);
      fetchCalendarEntries();
      setDate("");
      setTimeSlot("");
    } catch (error) {
      console.error("Error adding calendar entry:", error);
    }
  };

  const handleDeleteCalendarEntry = async (id) => {
    try {
      await deleteDoc(doc(db, "Calendar", id));
      fetchCalendarEntries();
    } catch (error) {
      console.error("Error deleting calendar entry:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
    {/* Sidebar - Always visible on desktop and mobile */}
    <div className="w-full md:w-1/6 bg-white shadow-md">
      <Admin />
    </div>

    <div className="w-full md:w-3/4 px-4 sm:px-6 pt-16 md:py-8 mx-auto">
        <section>
          <h2 className="text-3xl text-red-600 font-semibold mb-4">Manage Calendar</h2>
          <form className="space-y-4 bg-gray-100 p-6 rounded-lg mb-4">
            <div>
              <label className="block font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Select Time Slot</label>
              <input
                type="time"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
            </div>
            <button
              onClick={handleAddCalendarEntry}
              type="button"
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Add Calendar Entry
            </button>
          </form>

          <ul className="space-y-4">
            {calendarEntries.map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between items-center p-4 border rounded-lg bg-white shadow-md"
              >
                <div>
                  <p className="font-bold">{entry.date}</p>
                  <p className="text-sm text-gray-600">Time: {entry.timeSlot}</p>
                </div>
                <button
                  onClick={() => handleDeleteCalendarEntry(entry.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminCalendar;
