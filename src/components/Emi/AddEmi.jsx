import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import Admin from "../pages/Admin";

// Custom dropdown component for course selection
const CourseDropdown = ({ courses, selectedCourse, setSelectedCourse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedTitle =
    courses.find((course) => course.id === selectedCourse)?.title ||
    "Select a course";

  return (
    <div className="relative mb-4 flex justify-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 border border-red-300 rounded-lg w-full max-w-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gradient-to-r from-red-700 to-red-900 text-white"
      >
        {selectedTitle}
      </button>
      {isOpen && (
        <ul className="absolute mt-1 w-full max-w-xs bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg shadow-lg z-10">
          {courses.map((course) => (
            <li
              key={course.id}
              onClick={() => {
                setSelectedCourse(course.id);
                setIsOpen(false);
              }}
              className="p-3 cursor-pointer hover:bg-red-800"
            >
              {course.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [emiPlans, setEmiPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ duration: "", amount: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(false);

  useEffect(() => {
    // Fetch courses from `paidCourses`
    const unsubscribeCourses = onSnapshot(
      collection(db, "paidCourses"),
      (snapshot) => {
        const fetchedCourses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(fetchedCourses);
      }
    );

    return () => unsubscribeCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      // Fetch EMI plans for the selected course
      const plansQuery = query(
        collection(db, "emiPlans"),
        where("courseId", "==", selectedCourse)
      );
      const unsubscribePlans = onSnapshot(plansQuery, (snapshot) => {
        const fetchedPlans = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmiPlans(fetchedPlans);
      });

      return () => unsubscribePlans();
    }
  }, [selectedCourse]);

  const addEmiPlan = async () => {
    if (!selectedCourse || !newPlan.duration || !newPlan.amount) {
      alert("Please select a course and fill in the EMI details.");
      return;
    }

    await addDoc(collection(db, "emiPlans"), {
      ...newPlan,
      courseId: selectedCourse,
    });

    setNewPlan({ duration: "", amount: "" });
    alert("EMI plan added successfully!");
  };

  const deleteEmiPlan = async (id) => {
    await deleteDoc(doc(db, "emiPlans", id));
    alert("EMI plan deleted successfully!");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar - Always visible on desktop and mobile */}
      <div className="w-full md:w-1/6 bg-white shadow-md">
        <Admin />
      </div>

      <div className="w-full md:w-3/4 px-4 sm:px-6 pt-16 md:py-8 mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-red-600">
          Admin: Manage EMI Plans
        </h2>

        {/* Course Selection using the custom dropdown */}
        <CourseDropdown
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
        />

        {/* Add EMI Plan */}
        {selectedCourse && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              Add EMI Plan
            </h3>
            <input
              type="text"
              placeholder="Duration (e.g., 3 Months)"
              value={newPlan.duration}
              onChange={(e) =>
                setNewPlan({ ...newPlan, duration: e.target.value })
              }
              className="border border-red-300 p-2 rounded mb-2 w-full focus:outline-none focus:border-red-600 transition-colors duration-200"
            />
            <input
              type="number"
              placeholder="Amount (e.g., 5000)"
              value={newPlan.amount}
              onChange={(e) =>
                setNewPlan({ ...newPlan, amount: e.target.value })
              }
              className="border border-red-300 p-2 rounded mb-2 w-full focus:outline-none focus:border-red-600 transition-colors duration-200"
            />
            <button
              onClick={addEmiPlan}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors duration-200"
            >
              Add EMI Plan
            </button>
          </div>
        )}

        {/* List EMI Plans */}
        {selectedCourse && (
          <>
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              EMI Plans
            </h3>
            <ul className="space-y-4">
              {emiPlans.map((plan) => (
                <li
                  key={plan.id}
                  className="p-4 bg-gray-100 rounded shadow flex justify-between items-center"
                >
                  <div className="text-red-600">
                    <p className="font-semibold">
                      Duration: {plan.duration} Months
                    </p>
                    <p>Amount: ₹{plan.amount}</p>
                  </div>
                  <button
                    onClick={() => deleteEmiPlan(plan.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
