

import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Firebase configuration file

import { PieChart, Pie, Cell } from "recharts";

const EnrollCourse = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle state
  const [formData, setFormData] = useState({
    profilePic: "",
    fullName: "NA",
    email: "NA",
  });
  const navigate = useNavigate();
  const auth = getAuth();

  const fetchCourses = async (email) => {
    try {
      const docRef = doc(db, "subscriptions", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const freeCourses =
          data.freecourses?.map((courseName) => ({
            name: courseName,
            type: "Free",
            enrolled: true,
          })) || [];

        const paidCourses =
          data.DETAILS?.map((courseObj) => {
            const courseName = Object.keys(courseObj)[0];
            const details = courseObj[courseName];

            let daysLeft = 0;
            let usedDays = 0;
            let totalDays = 0;

            if (details.subscriptionDate && details.expiryDate) {
              const subDate = new Date(details.subscriptionDate);
              const expDate = new Date(details.expiryDate);
              const now = new Date();

              const totalTime = expDate.getTime() - subDate.getTime();
              totalDays = Math.floor(totalTime / (1000 * 3600 * 24));

              const usedTime = now.getTime() - subDate.getTime();
              usedDays = usedTime > 0 ? Math.floor(usedTime / (1000 * 3600 * 24)) : 0;

              const rawDaysLeft = totalDays - usedDays;
              daysLeft = rawDaysLeft < 0 ? 0 : rawDaysLeft;
            }

            return {
              name: courseName,
              type: "Paid",
              enrolled: details.status === "active",
              expiryDate: details.expiryDate,
              subscriptionDate: details.subscriptionDate,
              daysLeft,
              usedDays,
              totalDays,
            };
          }) || [];

        setCourses([...freeCourses, ...paidCourses]);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCourses(currentUser.email);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser);

      const fetchProfile = async () => {
        const userDocRef = doc(db, "students", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            profilePic: userData.profilePic || "",
            fullName: userData.fullName || "NA",
            email: currentUser.email || "NA",
          });
        } else {
          setFormData({
            profilePic: "",
            fullName: "NA",
            email: currentUser.email || "NA",
          });
        }

        setLoading(false);
      };

      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [db]);

  if (loading) {
    return <div className="text-center mt-10 font-bold text-red-600">Loading...</div>;
  }

  const MiniPieChart = ({ usedDays, daysLeft }) => {
    const data = [
      { name: "Days Used", value: usedDays },
      { name: "Days Left", value: daysLeft },
    ];
    const COLORS = ["#FF6347", "#FFDAB9"];

    if (usedDays === 0 && daysLeft === 0) {
      return <span className="text-red-400 font-medium">N/A</span>;
    }

    return (
      <div className="w-20 h-20 flex items-center justify-center">
        <PieChart width={80} height={80}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={35}
            labelLine={false}
            label={({ value }) => `${value}d`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 inset-y-0 left-0 bg-red-600 text-white shadow-lg transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:w-1/6`}
      >
        <div className="p-6 flex flex-col items-center">
          <img
            src={formData.profilePic || "https://via.placeholder.com/100"}
            alt="Profile"
            className="rounded-full mb-4 w-20 h-20 border-2 border-white"
          />
          <h2 className="text-lg font-bold">{formData.fullName}</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
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
                to="/dashboard"
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

      {/* Main Content */}
      <main className="flex-1 bg-white shadow-lg rounded-lg p-6 overflow-x-auto">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-red-500 text-white p-2 rounded-md md:hidden"
        >
          ☰
        </button>
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Your Courses</h2>

        {/* Show message if no courses are enrolled */}
        {courses.length === 0 ? (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">
              You are not enrolled in any courses yet.
            </h3>
            <p className="text-gray-600 mt-2">
              Explore our courses and start your learning journey today.
            </p>
            <Link to="/courses">
              <button className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Browse Courses
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile: Grid View */}
            <div className="grid gap-4 md:hidden">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg bg-red-50 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-700">{course.name}</h3>
                  <p className="text-sm text-gray-600">Type: {course.type}</p>
                  <p className="text-sm text-gray-600">Enrolled: {course.enrolled ? "Yes" : "No"}</p>
                  {course.type === "Paid" && (
                    <div className="mt-2 flex items-center space-x-2">
                      <MiniPieChart usedDays={course.usedDays} daysLeft={course.daysLeft} />
                      <span className="text-sm text-gray-600">Left: {course.daysLeft}d</span>
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/course/${encodeURIComponent(course.name)}`)}
                    className="mt-4 bg-red-500 hover:bg-red-400 text-white py-1 px-3 rounded"
                  >
                    Start Learning
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block">
              <table className="w-full bg-white rounded">
                <thead>
                  <tr className="bg-red-100 text-left">
                    <th className="py-3 px-4 font-medium text-gray-600">Course Name</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Enrolled</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Validity</th>
                    <th className="py-3 px-4 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-red-50 bg-white transition-shadow"
                    >
                      <td className="py-3 px-4 text-gray-700">{course.name}</td>
                      <td className="py-3 px-4 text-gray-700">{course.type}</td>
                      <td className="py-3 px-4 text-gray-700">{course.enrolled ? "Yes" : "No"}</td>
                      <td className="py-3 px-4">
                        {course.type === "Paid" ? (
                          <div className="flex items-center space-x-2">
                            <MiniPieChart usedDays={course.usedDays} daysLeft={course.daysLeft} />
                            <span className="text-sm text-gray-600">Left: {course.daysLeft}d</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/course/${encodeURIComponent(course.name)}`)}
                          className="bg-red-500 hover:bg-red-400 text-white py-1 px-3 rounded"
                        >
                          Start Learning
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

    </div>
  );
};

export default EnrollCourse;


