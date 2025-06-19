import React, { useState,useEffect  } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebaseConfig"; // Firebase config file
import { doc, getDocs, getDoc, collection } from "firebase/firestore";



import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


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

        const combinedCourses = [...paidCourses, ...freeCourses];

        const orderDoc = await getDoc(doc(db, "courseOrder", "displayOrder"));
        if (orderDoc.exists()) {
          const orderedIds = orderDoc.data().order;
          const orderedCourses = orderedIds
            .map(id => combinedCourses.find(c => c.id === id))
            .filter(c => c); // only keep found courses

          // Find remaining courses not in the order list
          const remainingCourses = combinedCourses.filter(c => !orderedIds.includes(c.id));

          // Combine both ordered and remaining courses
          const finalCourses = [...orderedCourses, ...remainingCourses];

          setCourses(finalCourses);
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
  console.log(courses)
  return (
    <footer className="relative bg-red-600 text-white py-6 px-4">
      {/* Background Image & Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/assets/footer_BG.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gray-800 opacity-30"></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* ========== DESKTOP FOOTER ========== */}
        <div className="hidden md:block">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* About Section */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-lg font-bold mb-4 text-orange-200">
                Vahlay Astro
              </h3>
              <p className="text-sm leading-relaxed mb-4">
                <strong>Vahlay Astro</strong>, your trusted partner in unlocking
                the mysteries of the cosmos. We offer tailored solutions for
                personal growth, success, and happiness.
              </p>
              <p className="text-sm leading-relaxed">
                Our mission is to help you achieve a deeper understanding of
                the cosmic world, offering guidance for life decisions and
                insights into your future.
              </p>
              <div className="mt-5">
                <Link to="/login">
                  <button className="bg-white text-red-600 font-bold py-1 px-6 rounded-full shadow-md hover:bg-red-600 hover:text-white hover:shadow-lg transition duration-300 ease-in-out">
                    Login
                  </button>
                </Link>
              </div>
            </div>

            {/* Overview Section */}

            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-lg font-bold text-orange-200 mb-4">
                Overview
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about-us" className="hover:text-gray-300">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-gray-300">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/articles" className="hover:text-gray-300">
                    Articles
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-gray-300">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link to="/appointment" className="hover:text-gray-300">
                    Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/consulting" className="hover:text-gray-300">
                    Consulting
                  </Link>
                </li>
              </ul>
            </div>

            {/* Courses Section */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-lg font-bold text-orange-200 mb-4">
                Courses
              </h3>
              {courses.map((course) => (
                <ul className="space-y-2" id={course.id}>
                  <li>
                    <Link to={`/coursedetail/${course.id}/${course.type}`} className="hover:text-gray-300">
                    {course.id}
                    </Link>
                  </li>
                </ul>
              ))}



            </div>

            {/* Contact Section */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-lg font-bold text-orange-200 mb-4">
                Contact Details
              </h3>
              <ul className="space-y-2 text-sm">
                <li>Email: contact@vahlayastro.com</li>
                <li>LandLine: +91 79 4921 7538</li>
              </ul>
              <h3 className="text-lg font-bold mt-6 text-orange-200 mb-2">
                Locations
              </h3>
              <p className="text-sm">
                C 515, Dev Aurum Commercial Complex, Prahlad Nagar,
                <br />
                Ahmedabad, Gujarat 380015
              </p>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7344.671029626906!2d72.51501100000002!3d23.01145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1733872195045!5m2!1sen!2sin"
                width="100%"
                height="160"
                className="border-0 rounded-lg shadow-lg mt-4"
                allowFullScreen=""
                loading="lazy"
                title="Map"
              ></iframe>
            </div>
          </div>

          {/* Social Icons (desktop) */}
          <div className="flex justify-center space-x-4 mt-10">
            <a
              href="https://www.facebook.com/profile.php?id=61572501694342"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition"
            >
              <FaFacebookF size={24} />
            </a>
            <a
              href="https://x.com/VahlayAstro2009"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition"
            >
              <FaXTwitter size={24} />
            </a>
            <a
              href="https://www.instagram.com/astro_vahlay_09/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="http://youtube.com/@VahlayAstro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition"
            >
              <FaYoutube size={24} />
            </a>
          </div>
        </div>
        {/* ========== END DESKTOP FOOTER ========== */}

        {/* ========== MOBILE FOOTER ========== */}
        <div className="block md:hidden mt-6">
          {/* 1) Top links (Courses, Articles, Consultation) */}
          <div className="mb-4 text-center text-sm space-x-2">
            <Link to="/courses" className="hover:underline">
              Courses
            </Link>
            <span>|</span>
            <Link to="/articles" className="hover:underline">
              Articles
            </Link>
            <span>|</span>
            <Link to="/consulting" className="hover:underline">
              Consultation
            </Link>
          </div>

          {/* 2) Logo & Buttons (centered) */}
          <div className="flex flex-col items-center">
            {/* Mobile Logo */}
            <img
              src="/assets/Astro_logos-navbar.png"
              alt="Vahlay Astro Logo"
              className="w-20 h-20 mb-2"
            />

            {/* Login Button */}
            <Link to="/login" className="mb-2">
              <button className="bg-white text-red-600 font-bold py-1 px-6 rounded-full shadow-md hover:bg-red-600 hover:text-white hover:shadow-lg transition duration-300 ease-in-out">
                Login
              </button>
            </Link>

            {/* Sitemap Dropdown (below Login) */}
            <MobileSitemap />
          </div>

          {/* 3) Social Icons (centered) */}
          <div className="flex justify-center space-x-4 mt-5">
            <a
              href="https://www.facebook.com/profile.php?id=61572501694342"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition"
            >
              <FaFacebookF size={24} />
            </a>
            <a
              href="https://x.com/VahlayAstro2009"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition"
            >
              <FaXTwitter size={24} />
            </a>
            <a
              href="https://www.instagram.com/astro_vahlay_09/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="http://youtube.com/@VahlayAstro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-orange-300 transition"
            >
              <FaYoutube size={24} />
            </a>
          </div>
        </div>
        {/* ========== END MOBILE FOOTER ========== */}
      </div>

      {/* Single Copyright */}
      <div className="relative z-10 mt-6 text-sm text-gray-300 text-center">
        © 2025 Vahlay Astro. All rights reserved.
      </div>
    </footer>
  );
};

/** 
 * Sub-component for the mobile Sitemap dropdown
 */
const MobileSitemap = () => {
  const [showSitemap, setShowSitemap] = useState(false);

  return (
    <div className="mt-4 text-center">
      {/* Toggle Button */}
      <button
        onClick={() => setShowSitemap(!showSitemap)}
        className="flex items-center justify-center w-full text-sm font-semibold focus:outline-none"
      >
        Sitemap
        <span className="ml-2">
          {showSitemap ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </button>

      {/* Dropdown Links */}
      {showSitemap && (
        <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-4 mt-2 mx-8 rounded-lg">
          <ul className="space-y-2 text-sm text-center">
            <li>
              <Link
                to="/about-us"
                className="hover:underline"
                onClick={() => setShowSitemap(false)}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className="hover:underline"
                onClick={() => setShowSitemap(false)}
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                to="/articles"
                className="hover:underline"
                onClick={() => setShowSitemap(false)}
              >
                Articles
              </Link>
            </li>
            <li>
              <Link
                to="/courses"
                className="hover:underline"
                onClick={() => setShowSitemap(false)}
              >
                Courses
              </Link>
            </li>
            <li>
              <Link
                to="/appointment"
                className="hover:underline"
                onClick={() => setShowSitemap(false)}
              >
                Appointment
              </Link>
            </li>
            <li>
              <Link
                to="/consulting"
                className="hover:underline"
                onClick={() => setShowSitemap(false)}
              >
                Consulting
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Footer;
