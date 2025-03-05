import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig"; // Firebase config file
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { RiShareForwardFill } from "react-icons/ri"; // Share icon
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp, FaEnvelope, FaTelegram, FaRedditAlien, FaPinterestP } from "react-icons/fa";
 
 
 
const CourseDetail = () => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);
 
  const location = useLocation();
  const navigate = useNavigate();
 
 
  const { courseId, courseType } = useParams()
 
 
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId || !courseType) {
        alert("Invalid course information.");
        navigate("/");
        return;
      }
 
      try {
        const courseRef = doc(
          db,
          courseType === "free" ? "freeCourses" : "paidCourses",
          courseId
        );
        const courseSnap = await getDoc(courseRef);
 
        if (courseSnap.exists()) {
          setCourseData({ id: courseId, type: courseType, ...courseSnap.data() });
        } else {
          alert("Course not found.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        alert("An error occurred while fetching course details.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
 
    fetchCourseDetails();
  }, [courseId, courseType, navigate]);
 
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
      </div>
    );
  }
 
  if (!courseData) {
    return <div className="text-center mt-10 text-red-500">Course not found.</div>;
  }
 
    // Function to share the article
    const currentUrl = window.location.href;
    const imageUrl = courseData.imageUrl || "/assets/default-course.jpg";
    const shareText = `Check out this course: ${courseData.title} - ${courseData.Subtitle}`;
 
    const shareArticle = () => {
      if (navigator.share) {
        navigator
          .share({
            title: courseData.title,
            text: shareText,
            url: currentUrl
          })
          .then(() => console.log("Course shared successfully!"))
          .catch((error) => console.error("Error sharing course:", error));
      } else {
        setShowShareOptions(!showShareOptions);
      }
    };
  return (
    <div>
      {/* Hero Section */}
      <section
        className="bg-white"
        style={{ backgroundImage: "url('/assets/Screenshot 2024-11-28 211019.png')" }}
      >
 
<div className="p-4">
<button
            onClick={shareArticle}
            className="flex items-center justify-center space-x-2 text-white bg-red-600 px-4 py-2 rounded-md shadow-md hover:bg-red-700 w-6/9 sm:w-auto sm:px-6 sm:py-3"
          >
            <RiShareForwardFill className="text-lg sm:text-xl " />
            <span className="hidden sm:inline text-sm sm:text-base">Share</span>
          </button>
          {showShareOptions && (
            <div className="flex space-x-4 mt-2">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xl"><FaFacebookF /></a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xl"><FaTwitter /></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 text-xl"><FaLinkedinIn /></a>
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' - ' + currentUrl)}`} target="_blank" rel="noopener noreferrer" className="text-green-500 text-xl"><FaWhatsapp /></a>
              <a href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent('Check out this amazing course: ' + currentUrl)}`} className="text-red-500 text-xl"><FaEnvelope /></a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xl"><FaTelegram /></a>
              <a href={`https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 text-xl"><FaRedditAlien /></a>
              <a href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="text-red-600 text-xl"><FaPinterestP /></a>
            </div>
          )}
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
          {/* Left Content */}
          <div className="space-y-4 md:w-2/3 ">
            <h1 className="text-3xl md:text-4xl font-bold text-red-900">
              {courseData.title || "No Title"}
            </h1>
            <p className="text-red-600 text-lg">
              {courseData.Subtitle || "No description available."}
            </p>
            <div>
              <p className="text-red-900">
                <span className="font-bold text-red-900">4.1 stars</span> | 67 ratings
              </p>
            </div>
          </div>
 
          {/* Right Content - Image */}
          <div className="mt-6 md:mt-0 md:w-1/3">
            <img
              src={"/assets/hansal sir.jpg"}
              className="rounded-lg shadow-md w-full"
            />
          </div>
        </div>
      </section>
 
      {/* Bottom Info Section */}
      <div className="bg-red-600 relative flex">
        {/* Left Section */}
        <div className="w-3/4 py-6 relative">
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l3 3m6-6a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">24 sessions</p>
                <p className="text-white text-sm">Q+A session Extra</p>
              </div>
            </div>
 
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 18.75a8.25 8.25 0 0115 0"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">Self-paced</p>
                <p className="text-white text-sm">Progress at your own speed</p>
              </div>
            </div>
 
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-2.25 0-4 1.567-4 3.5S9.75 15 12 15m0 0c2.25 0 4-1.567 4-3.5S14.25 8 12 8zm0 0V6m0 9v2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">{courseData.type || "Unknown"}</p>
                <p className="text-white text-sm">Please Enroll</p>
              </div>
            </div>
          </div>
        </div>
 
 
        {/* Right Section */}
        <Link to={courseData.type === "free" ? `/enrollfree` : `/enroll/${courseId}/${courseType}`}>
  <button className="mt-6 text-white bg-red-400 px-10 py-4 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 hover:bg-red-100 hover:text-red-600 animate-bounce">
    {courseData.type === "free" ? "Enroll for Free" : "Enroll Now"}
  </button>
</Link>
 
      </div>
 
 
      {/* What You Will Learn Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left - List of Topics */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">
              What You Will Learn
            </h2>
            <ul className="list-disc text-lg pl-6 text-red-600 font-bold">
  {courseData.description?.split(".").map((item, index) =>
    item.trim() ? <li className="mb-2"key={index}>{item}</li> : null
  )}
</ul>
 
            <p className="mt-8 text-xl text-center lg:text-left font-semibold text-red-600">
              Classes Conducted Twice Weekly - 24 Lectures + Interactive Q&A
            </p>
          </div>
 
          {/* Right - Course Image */}
          <div className="flex justify-center items-center">
            <img
              src={courseData.imageUrl}
              alt="Course"
              className="rounded-lg shadow-lg w-full max-w-lg"
            />
          </div>
        </div>
      </section>
 
      {/* Why You Should Enroll Section */}
      <section className="bg-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Why You Should Enroll
          </h2>
          <ul className="mt-4 space-y-4 text-center text-gray-700 text-lg">
            <li>✔ Learn practical skills in less than 2 hours</li>
            <li>✔ Taught by industry experts</li>
            <li>✔ Hands-on learning with real-world applications</li>
          </ul>
        </div>
      </section>
 
      {/* How You Learn Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            How You Learn
          </h2>
          <p className="text-lg text-gray-600">
            Gain real-world skills by practicing in a hands-on environment
            guided by experts in the field.
          </p>
        </div>
      </section>
 
      {/* Testimonials Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Why People Choose Us
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "This course helped me land my first job in business analysis!",
                author: "John Doe",
              },
              {
                quote: "A great resource for anyone looking to upskill quickly.",
                author: "Jane Smith",
              },
              {
                quote:
                  "The guided project was very practical and easy to follow.",
                author: "Alex Taylor",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white shadow-lg rounded-lg hover:shadow-2xl transition"
              >
                <p className="italic text-gray-700">{testimonial.quote}</p>
                <p className="mt-4 text-right text-gray-900 font-bold">
                  — {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
 
 
      <Link to={courseData.type === "free" ? `/enrollfree` : `/enroll/${courseId}/${courseType}`}>
  <button className="mt-6 text-white bg-red-400 px-10 py-4 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 hover:bg-red-100 hover:text-red-600 animate-bounce">
    {courseData.type === "free" ? "Enroll for Free" : "Enroll Now"}
  </button>
</Link>
 
    </div>
  );
};
 
export default CourseDetail;