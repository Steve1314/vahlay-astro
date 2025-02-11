

import React, { useState, useEffect } from "react";
import { useNavigate, Link, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import EnrollCourse from "./EnrolledCourses";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile sidebar toggle
  const [loading, setLoading] = useState(true); // Prevent flickering while loading
  const [formData, setFormData] = useState({
    profilePic: "",
    fullName: "NA",
    fathersName: "NA",
    mothersName: "NA",
    dob: "NA",
    email: "NA",
  });

  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser);

      // Fetch user profile from Firestore
      const fetchProfile = async () => {
        const userDocRef = doc(db, "students", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            profilePic: userData.profilePic || "",
            fullName: userData.fullName || "NA",
            fathersName: userData.fathersName || "NA",
            mothersName: userData.mothersName || "NA",
            dob: userData.dob || "NA",
            email: currentUser.email || "NA",
          });
        } else {
          // If user profile doesn't exist, set default values
          setFormData({
            profilePic: "",
            fullName: "NA",
            fathersName: "NA",
            mothersName: "NA",
            dob: "NA",
            email: currentUser.email || "NA",
          });
        }

        setLoading(false); // Stop loading once the profile is fetched
      };

      fetchProfile();
    } else {
      setLoading(false); // If no user is logged in, stop loading
    }
  }, [db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    navigate("/enrolledcourse"); // ✅ Ensure default view is "Enrolled Courses"
  }, [navigate]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 bg-red-500 text-white p-2 rounded z-50"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-gradient-to-b from-red-600 to-red-500 text-white shadow-lg z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-300 w-64`}
      >
        <div className="p-6 flex flex-col items-center">
          {/* Show Default Profile Icon if No Image */}
          <img
            src={formData.profilePic || "https://via.placeholder.com/100"}
            alt="Profile"
            className="rounded-full mb-4 w-24 h-24 object-cover border-2 border-white"
          />
          <h2 className="text-lg font-bold">{formData.fullName || "User"}</h2>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link
                to="/profile"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
                onClick={() => setSidebarOpen(false)} // ✅ Close sidebar on mobile
              >
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="/enrolledcourse"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
                onClick={() => setSidebarOpen(false)}
              >
                Enrolled Courses
              </Link>
            </li>
            <li>
              <Link
                to="/courses"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
                onClick={() => setSidebarOpen(false)}
              >
                Add Courses
              </Link>
            </li>
            <li>
              <Link
                to="/finalize"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
                onClick={() => setSidebarOpen(false)}
              >
                Payment
              </Link>
            </li>
          </ul>
        </nav>
      </aside>


    </div>
  );
};

export default Dashboard;
