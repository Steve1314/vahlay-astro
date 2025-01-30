import React, { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const StudentLiveSession = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
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
      }
    };

    fetchCourses();
  }, []);

  const fetchSessions = async (courseId) => {
    try {
      const db = getFirestore();
      const sessionsQuery = query(collection(db, "sessions"), where("courseId", "==", courseId));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessionsList = sessionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(sessionsList);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    fetchSessions(courseId);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Join Live Sessions</h2>

      {/* Course Dropdown */}
      <select
        value={selectedCourse}
        onChange={handleCourseChange}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">-- Select a Course --</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title} ({course.type === "free" ? "Free" : "Paid"})
          </option>
        ))}
      </select>

      {/* Sessions List */}
      {sessions.length > 0 ? (
        sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 bg-gray-100 rounded shadow mb-4 flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">{session.title}</h3>
              <p>
                <strong>Date:</strong> {session.date} | <strong>Time:</strong> {session.time}
              </p>
              <p>
                <strong>Room:</strong> {session.roomName}
              </p>
            </div>
            <button
              onClick={() => setActiveSession(session)}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Join
            </button>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No sessions available for this course.</p>
      )}

      {/* Active Session */}
      {activeSession && (
        <div>
          <h3 className="text-xl font-semibold mb-3">{activeSession.title}</h3>
          <iframe
            src={`https://meet.jit.si/${activeSession.roomName}`}
            className="w-full h-96 border rounded"
            title="Live Session"
          ></iframe>
          <button
            onClick={() => setActiveSession(null)}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Leave Session
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentLiveSession;
