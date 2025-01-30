import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // For icons

const AdminSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-20 bg-red-600 text-white p-2 rounded-md shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`w-full md:w-1/5 bg-red-600 text-white p-4 shadow-lg transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:relative top-0 left-0 h-screen z-10`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          {/* Close Button on Mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-2xl font-bold md:hidden"
          >
            ✖
          </button>
        </div>

        <ul className="space-y-4">
          {[
            { name: "Articles", path: "/adminarticle" },
            { name: "Subscribe List", path: "/adminsubscribecourselist" },
            { name: "Calendar", path: "/admincalendar" },
            { name: "Add Course", path: "/addcourse" },
            { name: "Add Module", path: "/addmodule" },
            { name: "Add Live Session", path: "/addmeeting" },
            { name: "Add EMI Plans", path: "/admin/addemi" },
            { name: "Track EMI Plans", path: "/admin/emailuserlist" },
            { name: "Payment List", path: "/payment" },
          ].map((item, index) => (
            <li key={index} className="p-2 hover:bg-white hover:text-red-600 rounded">
              <Link to={item.path}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default AdminSidebar;
