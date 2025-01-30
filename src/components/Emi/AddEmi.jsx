
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

const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [emiPlans, setEmiPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ duration: "", amount: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(false);

  useEffect(() => {
    // Fetch courses from `paidCourses`
    const unsubscribeCourses = onSnapshot(collection(db, "paidCourses"), (snapshot) => {
      const fetchedCourses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCourses(fetchedCourses);
    });

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
            <li className="p-2 hover:bg-white hover:text-red-600 rounded">
              <Link to="/adminsubscribecourselist">Subscribe List</Link>
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
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white shadow rounded p-6 border border-red-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors duration-200"
          >
            Open Menu
          </button>

          <h2 className="text-2xl font-bold mb-4 text-red-600">Admin: Manage EMI Plans</h2>

          {/* Course Selection */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="mb-4 w-full border border-red-300 rounded px-3 py-2 focus:outline-none focus:border-red-600 transition-colors duration-200"
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.id}
              </option>
            ))}
          </select>

          {/* Add EMI Plan */}
          {selectedCourse && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-red-600">Add EMI Plan</h3>
              <input
                type="text"
                placeholder="Duration (e.g., 3 Months)"
                value={newPlan.duration}
                onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                className="border border-red-300 p-2 rounded mb-2 w-full focus:outline-none focus:border-red-600 transition-colors duration-200"
              />
              <input
                type="number"
                placeholder="Amount (e.g., 5000)"
                value={newPlan.amount}
                onChange={(e) => setNewPlan({ ...newPlan, amount: e.target.value })}
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
              <h3 className="text-lg font-semibold mb-2 text-red-600">EMI Plans</h3>
              <ul className="space-y-4">
                {emiPlans.map((plan) => (
                  <li
                    key={plan.id}
                    className="p-4 bg-gray-100 rounded shadow flex justify-between items-center"
                  >
                    <div className="text-red-600">
                      <p className="font-semibold">Duration: {plan.duration} Months</p>
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
    </div>
  );
};

export default AdminPanel;
