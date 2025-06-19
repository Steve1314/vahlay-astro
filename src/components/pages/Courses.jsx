

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebaseConfig"; // Firebase config file
import { doc, getDocs, getDoc, collection } from "firebase/firestore";

const HeroSection = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

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

        // Combine and sort courses to display paid courses first
        const combinedCourses = [...paidCourses, ...freeCourses];

      const orderDoc = await getDoc(doc(db, "courseOrder", "displayOrder"));
        if (orderDoc.exists()) {
          const orderedIds = orderDoc.data().order;
          const sortedCourses = orderedIds.map(id => combinedCourses.find(c => c.id === id)).filter(c => c);
          setCourses(sortedCourses);
        } else {
          setCourses(combinedCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        alert("Failed to fetch courses. Please try again later.");
      }
    };

    fetchCourses();

    return () => unsubscribe();
  }, []);

  
  const handleCourseClick = async (course) => {
    if (!user) {
      navigate("/login");
      return;
    }

    

    try {
      const subscriptionSnap = await getDoc(doc(db, "subscriptions", user.email));
      const subscriptionData = subscriptionSnap.exists() ? subscriptionSnap.data() : null;

      if (subscriptionData) {
        const enrolledCourses =
          course.type === "free"
            ? subscriptionData.freecourses || []
            : subscriptionData.DETAILS || [];

        const isEnrolled =
          course.type === "free"
            ? enrolledCourses.includes(course.title)
            : enrolledCourses.some(
                (details) =>
                  details[course.title]?.status === "active" &&
                  new Date(details[course.title]?.expiryDate) > new Date()
              );

        if (isEnrolled) {
          navigate("/dashboard");
        } else {
          navigate(`/coursedetail/${course.id}/${course.type}`, {
            state: { courseId: course.id, courseType: course.type },
          });
        }
      } else {
        navigate(`/coursedetail/${course.id}/${course.type}`, {
          state: { courseId: course.id, courseType: course.type },
        });
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="relative bg-ivory overflow-hidden min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-ivory skew-y-6 transform"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-20 py-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-5xl font-extrabold text-gray-900">
              Align Your Life with <br />
              <span className="text-red-600"> <strong>Vahlay Astro </strong></span>
            </h1>
            <p className="text-lg text-gray-700">
              It’s Not Just A Course, It’s A Life-Changing Experience!
            </p>
          </div>
          <div className="relative lg:w-1/2">
            <div className="absolute bg-gradient-to-bl from-red-100 to-red-300 w-72 h-72 rounded-full blur-2xl top-10 left-20"></div>
            <img
              src="/assets/wheel.png"
              alt="Astrology Wheel"
              className="relative w-80 h-80 mx-auto hover:scale-105 transition-transform animate-slowspin"
            />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 my-10">
        <div className="text-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {courses.map((course, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-red-600 shadow-lg rounded-xl hover:shadow-2xl hover:scale-105 transform transition duration-300"
              onClick={(e) => {
                e.preventDefault();
                handleCourseClick(course);
              }}
            >
              <div className="mb-4">
              <div className="absolute top-0 left-2 m-2  rounded-full shadow-lg flex items-center justify-center">
                  <img
                    src="/assets/vahlay_astro.png"
                    alt="logo"
                    className=" w-14 h-14  bg-white object-contain rounded-full"
                  />
                </div>
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="max-w-full h-auto object-cover rounded-t-xl border-8 border-orange-100"
                />
              </div>
              <div className="px-2">
                <h3 className="text-center text-lg font-bold text-red-600">
                  {course.title}
                </h3>
                <p className="text-center text-sm text-gray-700 mb-4">
                  {course.Subtitle || "Untitled Course"}
                </p>
                {course.type === "free" ? (
                   <Link to={`/enrollfree/${course.id}/${course.type}`} className="block text-center text-white bg-red-600 font-medium py-2 rounded-lg hover:bg-red-700 transition">
                   Enroll Now →
                 </Link>
                ) : course.type === "paid" ? (
                  <Link to={`/enroll/${course.id}/${course.type}`} className="block text-center text-white bg-red-600 font-medium py-2 rounded-lg hover:bg-red-700 transition">
                  Enroll Now →
                </Link>
                ) : (
                  <p className="text-center text-red-500 font-semibold">Unknown Course Type</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;




