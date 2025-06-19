import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Admin from "./Admin";

const AdminContact = () => {
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedInquiry, setExpandedInquiry] = useState(null); // Track expanded inquiry for mobile view

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const inquiriesRef = collection(db, "Astro_Contact");
        const inquirySnapshot = await getDocs(inquiriesRef);
        const inquiryList = inquirySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInquiries(inquiryList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching inquiries:", error);
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  // ✅ Delete Inquiry
  const handleDeleteInquiry = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this inquiry?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "Astro_Contact", id));
      setInquiries(inquiries.filter((inquiry) => inquiry.id !== id)); // Update UI
      alert("Inquiry deleted successfully!");
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      alert("Failed to delete the inquiry. Please try again.");
    }
  };

  // ✅ Filter inquiries based on search term
  const filteredInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:p-0 p-4 py-16 bg-gray-100">
      {/* Sidebar */}
      <div className=" shadow-md">
        <Admin />
      </div>

      <div className="w-full max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md  ">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">📩 Contact Inquiries</h2>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search inquiries..."
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Loading & No Results Handling */}
        {loading ? (
          <p className="text-center text-gray-600">Loading inquiries...</p>
        ) : filteredInquiries.length === 0 ? (
          <p className="text-center text-gray-500">No inquiries found.</p>
        ) : (
          <>
            {/* ✅ Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 p-2">Name</th>
                    <th className="border border-gray-300 p-2">Email</th>
                    <th className="border border-gray-300 p-2">Phone</th>
                    <th className="border border-gray-300 p-2">Message</th>
                    <th className="border border-gray-300 p-2">Date</th>
                    <th className="border border-gray-300 p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="text-center bg-white hover:bg-gray-100">
                      <td className="border border-gray-300 p-2">{inquiry.name}</td>
                      <td className="border border-gray-300 p-2">{inquiry.email}</td>
                      <td className="border border-gray-300 p-2">{inquiry.phone}</td>
                      <td className="border border-gray-300 p-2 truncate max-w-sm">{inquiry.message}</td>
                      <td className="border border-gray-300 p-2">
                        {inquiry.timestamp?.toDate().toLocaleString()}
                      </td>
                      <td className="border border-gray-300 p-2">
                        <button
                          onClick={() => handleDeleteInquiry(inquiry.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Mobile List View */}
            <div className="md:hidden">
              {filteredInquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">{inquiry.name}</h3>
                      <p className="text-gray-600">{inquiry.email}</p>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedInquiry(expandedInquiry === inquiry.id ? null : inquiry.id)
                      }
                      className="text-blue-500 hover:underline focus:outline-none"
                    >
                      {expandedInquiry === inquiry.id ? "Show Less ▲" : "Show More ▼"}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedInquiry === inquiry.id && (
                    <div className="mt-3 text-gray-700">
                      <p><strong>📞 Phone:</strong> {inquiry.phone}</p>
                      <p><strong>📜 Message:</strong> {inquiry.message}</p>
                      <p><strong>📅 Date:</strong> {inquiry.timestamp?.toDate().toLocaleString()}</p>

                      {/* Delete Button for Mobile */}
                      <button
                        onClick={() => handleDeleteInquiry(inquiry.id)}
                        className="bg-red-500 text-white px-3 py-2 rounded mt-2 w-full hover:bg-red-700 transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminContact;
