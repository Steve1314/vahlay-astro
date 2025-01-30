
import React, { useState, useEffect } from "react";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Replace with your Firebase config import
import { Link } from "react-router-dom";

const AdminPortal = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingStartTime, setMeetingStartTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(false);


  const fetchCourses = async () => {
    try {
      const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
      const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "free",
      }));

      const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));
      const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "paid",
      }));

      setCourses([...freeCourses, ...paidCourses]);
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Failed to fetch courses. Please try again later.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const saveMeetingDetails = async () => {
    if (!selectedCourse || !meetingUrl || !meetingStartTime) {
      alert("Please select a course, provide a meeting URL, and set a start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      await setDoc(doc(db, "courseMeetings", selectedCourse), {
        meetingUrl,
        meetingStartTime,
      });

      alert("Meeting URL and start time saved successfully!");
      setSelectedCourse("");
      setMeetingUrl("");
      setMeetingStartTime("");
    } catch (error) {
      console.error("Error saving meeting details:", error);
      alert("Failed to save meeting details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen min-h-screen">
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
      <div className="flex-1 bg-gradient-to-b from-red-500 to-white p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 text-center mb-4">
            Admin Portal - Add Meeting Details
          </h1>

          <div className="mb-4">
            <label className="block text-red-700 font-semibold mb-2">Select Course</label>
            <select
              className="w-full p-3 border-2 border-red-500 rounded-md"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Select a Course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.type === "free" ? "🆓" : "💰"} {course.id}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-red-700 font-semibold mb-2">Meeting URL</label>
            <input
              type="text"
              className="w-full p-3 border-2 border-red-500 rounded-md"
              placeholder="Enter meeting URL"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-red-700 font-semibold mb-2">Meeting Start Time</label>
            <input
              type="datetime-local"
              className="w-full p-3 border-2 border-red-500 rounded-md"
              value={meetingStartTime}
              onChange={(e) => setMeetingStartTime(e.target.value)}
            />
          </div>

          <button
            className={`w-full p-3 rounded-md text-white font-bold ${isSubmitting
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
              }`}
            onClick={saveMeetingDetails}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Meeting Details"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
