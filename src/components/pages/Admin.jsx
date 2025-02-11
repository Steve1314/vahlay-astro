import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { path } from "framer-motion/client";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.classList.add("overflow-hidden"); // Prevent scrolling
    } else {
      document.body.classList.remove("overflow-hidden"); // Restore scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const menuItems =[
    { name: "Add Articles", path: "/admin/adminarticle" },
    { name: "Calendar", path: "/admin/admincalendar" },
    { name: "Add Course", path: "/admin/addcourse" },
    { name: "Add Module", path: "/admin/addmodule" },
    { name: "Add Live Session", path: "/admin/addmeeting" },
    { name: "Subscribe List", path: "/admin/adminsubscribecourselist" },
    { name: "Add EMI Plans", path: "/admin/addemi" },
    { name: "Track EMI Plans", path: "/admin/emailuserlist" },
    { name: "Payment List", path: "/admin/payment" },       
    { name: "Course Inquiry", path: "/admin/admininquiry" },            
    { name: "ContactUs Inquiry", path: "/admin/admincontact" },
    { name: "Question & Ans", path: "/admin/question-ans" },
    {name:"Course Order",path:"/admin/admincourseorder"},
    {name:"Vedio Order",path:"/admin/vedio-order"},


   

  ]
  return (
    <>
      {/* Sidebar Toggle Button (Only for Mobile) */}
      {!isOpen && (
        <button
          className="lg:hidden fixed top-24 left-4 bg-red-800 text-white p-2 rounded-md z-50"
          onClick={() => setIsOpen(true)}
        >
          <IoIosArrowForward size={24} className="text-white" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-red-800 text-white h-full w-64 p-6 fixed lg:relative transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Close Button (Mobile Only) */}
        <button
          className="lg:hidden absolute top-4 right-4 text-white"
          onClick={() => setIsOpen(false)}
        >
          <IoIosArrowBack size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Admin Portal</h2>
        <nav>
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li key={index} className="p-2 hover:bg-white hover:text-red-600 rounded">
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for Mobile (Closes Sidebar when clicked outside) */}
      {isOpen && (
        <ul className="space-y-4">
        {menuItems.map((item, index) => (
          <li key={index} className="p-2 hover:bg-white hover:text-red-600 rounded" onClick={() => setIsOpen(false)}>
            <Link to={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>
      )}
    </>
  );
};

export default SideBar;
