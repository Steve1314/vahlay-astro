import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db, app } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Notification from "./Emi/Notification";
import LanguageSelector from "./LanguageSelector"

const auth = getAuth(app);

const Navbar = () => {
  const [userName, setUserName] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const location = useLocation(); // To get the current route path
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User");
        checkAdminStatus(user.email);
      } else {
        setUserName(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAdminStatus = async (email) => {
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === email && userData.isAdmin) {
          setIsAdmin(true);
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUserName(null);
        setIsAdmin(false);
        navigate("/home");
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

  // Function to apply active link style
  const isActive = (path) => {
    return location.pathname === path
    ? " mt-2 font-semibold " // Active item style with orange-200 shadow
      : "text-gray-900 hover:text-red-600"; // Default style with hover effect
  };
  

  return (
    <header className="bg-gradient-to-r from-orange-100 via-red-400 to-red-600 py-2 shadow-md">

      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo Section */}
        <div>
          <Link to="/home">
            <img src="/assets/vahlay_astro.png" alt="Logo" className="w-24 h-auto" />
          </Link>
        </div>

        {/* Hamburger Icon for Medium and Small Screens */}
        <button
          className="md:block lg:hidden text-white text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Navbar Links Section */}
        <nav
          className={`fixed top-0 left-0 h-full w-3/4 bg-red-600 text-white z-50 transform transition-transform duration-300 md:hidden lg:block ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col items-center p-4 space-y-6">
            <button
              className="self-end text-2xl focus:outline-none"
              onClick={() => setMenuOpen(false)}
            >
              &times;
            </button>

            <div>
              <Link to="/home">
                <img src="/assets/Astro_logos-navbar.png" alt="Logo" className="w-16 h-16" />
              </Link>
            </div>

            {userName ? (
              <div className="text-center">
                <p className="font-medium text-lg truncate">Welcome, {userName}</p>
                <button
                  onClick={handleLogout}
                  className="bg-white text-red-600 px-4 py-2 mt-2 rounded-md shadow-md hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 mt-4">
                <Link
                  to="/signup"
                  className="bg-white text-red-600 px-4 py-2 rounded-md shadow-md hover:bg-gray-100 w-full text-center"
                >
                  SignUp
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-red-600 px-4 py-2 rounded-md shadow-md hover:bg-gray-100 w-full text-center"
                >
                  Login
                </Link>
              </div>
            )}

            <div className="flex flex-col items-start space-y-4 mt-4">
              <Link to="/" className={`hover:text-gray-300 transition ${isActive('/')}`} onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link to="/about-us" className={`hover:text-gray-300 transition ${isActive('/about-us')}`} onClick={() => setMenuOpen(false)}>
                About Us
              </Link>
              <Link to="/articles" className={`hover:text-gray-300 transition ${isActive('/articles')}`} onClick={() => setMenuOpen(false)}>
                Articles
              </Link>
              <Link to="/courses" className={`hover:text-gray-300 transition ${isActive('/courses')}`} onClick={() => setMenuOpen(false)}>
                Courses
              </Link>
              <Link to="/appointment" className={`hover:text-gray-300 transition ${isActive('/appointment')}`} onClick={() => setMenuOpen(false)}>
                Appointment
              </Link>
              <Link to="/contact-us" className={`hover:text-gray-300 transition ${isActive('/contact-us')}`} onClick={() => setMenuOpen(false)}>
                Contact Us
              </Link>
              {userName && (
                <Link to="/dashboard" className={`hover:text-gray-300 transition ${isActive('/dashboard')}`} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className={`hover:text-gray-300 transition ${isActive('/admin')}`} onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-9 flex-wrap text-sm md:text-sm lg:text-sm xl:text-l">
          <Link to="/" className={`hover:text-gray-300 transition ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/about-us" className={`hover:text-gray-300 transition ${isActive('/about-us')}`}>
            About Us
          </Link>
          <Link to="/articles" className={`hover:text-gray-300 transition ${isActive('/articles')}`}>
            Articles
          </Link>
          <Link to="/courses" className={`hover:text-gray-300 transition ${isActive('/courses')}`}>
            Courses
          </Link>
          <Link to="/appointment" className={`hover:text-gray-300 transition ${isActive('/appointment')}`}>
            Appointment
          </Link>
          <Link to="/contact-us" className={`hover:text-gray-300 transition ${isActive('/contact-us')}`}>
            Contact Us
          </Link>
          {userName && (
            <Link to="/dashboard" className={`hover:text-gray-300 transition ${isActive('/enrolledcourse')}`}>
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={`hover:text-gray-300 transition ${isActive('/admin')}`}>
              Admin
            </Link>
          )}
          {userName && (
            <div className="flex items-center space-x-2">
              <h6 className="font-medium  text-base truncate"> {userName}</h6>
              <button
                onClick={handleLogout}
                className="bg-red-700 text-white text-sm px-4 py-2 rounded-full shadow-md hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
          <Notification />
            <LanguageSelector/>

       

        </div>
      </div>
    </header>
  );
};

export default Navbar;
