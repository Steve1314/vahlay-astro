import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import {
  MdArticle,
  MdCalendarMonth,
  MdLibraryAdd,
  MdViewModule,
  MdVideoCall,
  MdSubscriptions,
  MdAttachMoney,
  MdTrackChanges,
  MdPayment,
  MdQuestionAnswer,
  MdContactMail,
  MdLiveHelp,
  MdVideoLibrary,
  MdShoppingCart,
} from "react-icons/md";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 768
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const menuItems = [
    { name: "Add Articles", path: "/admin/adminarticle", icon: <MdArticle /> },
    { name: "Calendar", path: "/admin/admincalendar", icon: <MdCalendarMonth /> },
    { name: "Add Course", path: "/admin/addcourse", icon: <MdLibraryAdd /> },
    { name: "Add Module", path: "/admin/addmodule", icon: <MdViewModule /> },
    { name: "Add Live Session", path: "/admin/addmeeting", icon: <MdVideoCall /> },
    { name: "Subscribe List", path: "/admin/adminsubscribecourselist", icon: <MdSubscriptions /> },
    { name: "Add EMI Plans", path: "/admin/addemi", icon: <MdAttachMoney /> },
    { name: "Track EMI Plans", path: "/admin/emailuserlist", icon: <MdTrackChanges /> },
    { name: "Payment List", path: "/admin/payment", icon: <MdPayment /> },
    { name: "Course Inquiry", path: "/admin/admininquiry", icon: <MdLiveHelp /> },
    { name: "ContactUs Inquiry", path: "/admin/admincontact", icon: <MdContactMail /> },
    { name: "Question & Ans", path: "/admin/question-ans", icon: <MdQuestionAnswer /> },
    { name: "Course Order", path: "/admin/admincourseorder", icon: <MdShoppingCart /> },
    { name: "Video Order", path: "/admin/vedio-order", icon: <MdVideoLibrary /> },
  ];

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          className="lg:hidden fixed top-24 left-4 text-white p-2 rounded-full z-40"
          onClick={() => setIsOpen(true)}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/14025/14025507.png"
            alt="menu"
            className="h-8"
          />
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`bg-red-600 text-white h-full md:w-64 w-4/5 p-6 fixed lg:relative transition-transform overflow-y-scroll md:overflow-auto left-0 top-0 z-50 duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <button
          className="lg:hidden absolute top-7 right-4 text-white"
          onClick={() => setIsOpen(false)}
        >
          <IoIosArrowBack size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Admin Portal</h2>
        <nav>
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className="p-2 hover:bg-white hover:text-red-600 rounded flex items-center gap-2"
              ><span className="text-2xl"> {item.icon}</span>
               
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default SideBar;
