import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db, app } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import Notification from "./Emi/Notification";
import LanguageSelector from "./LanguageSelector";

const auth = getAuth(app);

const Navbar = () => {
  const [userName, setUserName] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 768
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user)
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
      const q = query(usersCollection, where("email", "==", email));
      const usersSnapshot = await getDocs(q);

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.isAdmin) {
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

  const isActive = (path) =>
    location.pathname === path
      ? "font-semibold md:p-2 p-1 rounded-full bg-gradient-to-r text-gray-900 from-orange-100 to-white hover:text-red-600"
      : "text-orange-100 md:text-gray-900 hover:font-semibold hover:text-gray-900   hover:bg-gradient-to-r text-gray-900 from-orange-100 to-white  hover:p-1 hover:md:p-2 hover:rounded-full";

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about-us", label: "About Us" },
    { path: "/articles", label: "Articles" },
    { path: "/courses", label: "Courses" },
    { path: "/appointment", label: "Appointment" },
    { path: "/contact-us", label: "Contact Us" },
    ...(userName ? [{ path: "/enrolledcourse", label: "Dashboard" }] : []),
    ...(isAdmin ? [{ path: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="bg-gradient-to-r text-xs from-orange-100 via-red-400 to-red-600 py-2 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div>
          <Link to="/home">
            <img src="/assets/vahlay_astro.png" alt="Logo" className="w-16 h-16" />
          </Link>
        </div>

        {/* Hamburger Icon */}
        <div className="md:block lg:hidden flex flex-row space-x-6 p-2">
          <LanguageSelector />
          <Notification />
          <button
            className="text-white text-2xl focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Overlay */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          ></div>
        )}

        {/* Mobile Sidebar */}
        <nav
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full text-base w-4/5 bg-red-600 text-white z-50 transform transition-transform duration-300 md:hidden ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col justify-center items-center p-4 space-y-6">
            <button
              className="self-end text-2xl focus:outline-none"
              onClick={() => setMenuOpen(false)}
            >
              &times;
            </button>

            <Link to="/home">
              <img
                src="/assets/Astro_logos-navbar.png"
                alt="Logo"
                className="w-24 h-auto md:w-16"
              />
            </Link>

            {userName ? (
              <div className="text-center">
                <p className="font-medium text-lg truncate">Welcome, {userName}</p>
                <button
                  onClick={handleLogout}
                  className="bg-white text-red-600 px-4 py-1 mt-2 rounded-full shadow-md hover:bg-gray-100"
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

            <div className="flex flex-col text-base items-center space-y-6 mt-4 text-orange-100">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`hover:text-gray-300 shadow-lg  w-52 text-center rounded-xl transition ${isActive(link.path)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-9 flex-wrap">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`hover:text-gray-300 transition  ${isActive(link.path)}`}
            >
              {link.label}
            </Link>
          ))}

          {userName && (
            <div className="flex items-center space-x-2">
              <h6 className="font-medium text-sm truncate">{userName}</h6>
              <button
                onClick={handleLogout}
                className="bg-red-700 text-white text-xs px-4 py-1 rounded-full shadow-md hover:bg-red-900"
              >
                Logout
              </button>
            </div>
          )}
          <Notification />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
