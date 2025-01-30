// AdminCalendar.js (Professionally Styled and Responsive)
import React, { useState, useEffect } from "react";
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      {/* Sidebar */}
      <aside
        className={`w-full h-screen md:w-1/6 bg-red-600 text-white p-4 shadow-lg transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } md:relative fixed top-0 left-0 z-10`}
      >
        <div className="flex justify-between items-center mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-2xl font-bold"
          >
            ✖
          </button>
        </div>
        <ul className="mt-4">
          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/adminarticle">Articles</Link>
            </li>
          </div>



          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/admincalendar">Calendar</Link>
            </li>
          </div>

          <div>
            <li className="p-2 hover:bg-white hover:text-red-600 rounded">
              <Link to="/adminsubscribecourselist">Subscribe List</Link>
            </li>
          </div>

          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/addcourse">Add Course</Link>
            </li>
          </div>
          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/addmodule">Add Module</Link>
            </li>
          </div>
          {/* <div>
                 <li className="p-2 hover:bg-blue-100"><Link to="/adminlivesession">Add Live Session </Link></li>
               </div> */}
          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/addmeeting">Add Live Session</Link>
            </li>
          </div>
          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/admin/addemi">Add Emi Plans</Link>
            </li>
          </div>
          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/admin/emailuserlist">Track Emi Plans</Link>
            </li>
          </div>


          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <a href="/payment">Payment List</a>
            </li>
          </div>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden bg-red-500 text-white p-2 rounded flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

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
