
import React, { useState, useEffect } from "react";
import { useNavigate, Link, Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import EnrollCourse from "./EnrolledCourses";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile sidebar toggle
  const [loading, setLoading] = useState(true); // Loading state to prevent flickering
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

        setLoading(false); // Set loading to false once the profile is fetched
      };

      fetchProfile();
    } else {
      setLoading(false); // In case no user is logged in, stop loading
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
    navigate("/enrolledcourse"); // Default view when Dashboard is loaded
  }, [navigate]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-gradient-to-b from-red-600 to-red-500 text-white shadow-lg z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 transition-transform duration-300`}
      >
        <div className="p-6 flex flex-col items-center">
          <img
            src={formData.profilePic}
            alt="Profile"
            className="rounded-full mb-4 w-24 h-24"
          />
          <h2 className="text-lg font-bold">{user?.displayName || "User"}</h2>
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
                Payment
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden absolute top-4 left-4 bg-red-500 text-white p-2 rounded z-50"
      >
        ☰
      </button>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-64">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome, {user?.displayName || "User"}!
        </h1>

        {/* Enrolled Courses */}
        <Routes>
          <Route path="/enrolledcourse" element={<EnrollCourse />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
