import React, { useState, useEffect, useRef } from "react";
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
  const sidebarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 768
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

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

 

  return (
    <div className="flex flex-col md:flex-row md:min-h-screen  bg-gray-100">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-24 left-4 text-white p-2 rounded z-51"
      >
        <img
         src="https://cdn-icons-png.flaticon.com/512/14025/14025507.png" 
         alt="menu" 
         className="h-8"
         />
      </button>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={` p-4 fixed md:relative z-50  inset-y-0 left-0 bg-red-600 text-white shadow-lg transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-64 w-4/5 `}
      >
        <div className="flex justify-between items-center mb-4">
        </div>

        <div className="p-6 flex flex-col items-center">
          <img
            src={formData.profilePic}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-md object-cover"            />
          <h2 className="text-lg font-bold">{formData.fullName}</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-2xl font-bold absolute top-4 right-4 md:hidden"
          >
            ✖
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link
                to="/profile"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="/enrolledcourse"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                Enrolled Courses
              </Link>
            </li>
            <li>
              <Link
                to="/courses"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                Add Courses
              </Link>
            </li>
            <li>
              <Link
                to="/finalize"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                Payments
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Dashboard;
