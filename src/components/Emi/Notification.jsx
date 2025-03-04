


import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentUser = getAuth().currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    // Fetch notifications for the logged-in user
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(fetchedNotifications);

      // Count unread notifications
      const unread = fetchedNotifications.filter(
        (notif) => notif.status === "unread"
      ).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { status: "read" });
  };

  // ====== NEW: Delete a single notification ======
  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      alert("Notification deleted successfully.");
    } catch (error) {
      alert("Failed to delete notification.");
    }
  };

  // ====== NEW: Clear all notifications ======
  const clearAllNotifications = async () => {
    try {
      // Delete each notification document
      for (const notif of notifications) {
        await deleteDoc(doc(db, "notifications", notif.id));
      }
      alert("All notifications cleared.");
    } catch (error) {
      alert("Failed to clear notifications.");
    }
  };

  // ====== NEW: Navigate to /finalize on Pay ======
  const handlePay = (notif) => {
    // Instead of Razorpay, just navigate:
    navigate("/finalize");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={toggleDropdown}
        className="relative bg-red-600 p-2 rounded-full text-white hover:bg-red-700"
      >
        {/* Badge for unread count */}
        <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {unreadCount}
        </span>
        <BellIcon className="h-6 w-6" />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50">
          <div className="p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-red-600">Notifications</h3>
            <div className="space-x-2">
              {/* Clear All Button */}
              <button
                onClick={clearAllNotifications}
                className="text-sm text-white bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded-full"
              >
                Clear All
              </button>
              <button
                onClick={toggleDropdown}
                className="text-sm text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded-full"
              >
                Close
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No notifications available.
            </p>
          ) : (
            <ul className="space-y-2 p-4">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`p-3 rounded flex flex-col gap-2 sm:flex-row sm:justify-between items-start sm:items-center ${notif.status === "unread" ? "bg-red-100" : "bg-gray-100"
                    }`}
                >
                  {/* Notification Text */}
                  <div>
                    <p className="text-sm text-gray-800">{notif.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notif.timestamp.toDate()).toLocaleString()}
                    </p>
                  </div>

                  {/* Buttons Group */}
                  <div className="flex flex-wrap items-center gap-2">
                    {notif.status === "unread" && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                      >
                        Mark as Read
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-xs text-white bg-red-500 hover:bg-gray-600 px-2 py-1 rounded"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => handlePay(notif)}
                      className="text-xs text-white bg-red-600 hover:bg-green-700 px-2 py-1 rounded"
                    >
                      Pay
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
