import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import Admin from "./Admin";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const AdminEnrolledUsers = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [expend, setExpend] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [courses, setCourses] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [newSubscriber, setNewSubscriber] = useState({
    userId: "",
    course: "",
    courseType: "paid",
    status: "active",
    subscriptionDate: today,
    expiryDate: expiry,
  });

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "paidCourses"), (snapshot) => {
      const paid = snapshot.docs.map((doc) => ({ id: doc.id, type: "paid" }));
      paid.sort((a, b) => a.id.localeCompare(b.id));
      setCourses(paid);
      setAllCourses((prev) => {
        const free = prev.filter((c) => c.type === "free");
        return [...free, ...paid];
      });
    });

    const unsub2 = onSnapshot(collection(db, "freeCourses"), (snapshot) => {
      const free = snapshot.docs.map((doc) => ({ id: doc.id, type: "free" }));
      free.sort((a, b) => a.id.localeCompare(b.id));
      setFreeCourses(free.map((f) => f.id));
      setAllCourses((prev) => {
        const paid = prev.filter((c) => c.type === "paid");
        return [...paid, ...free];
      });
    });

    const unsub3 = onSnapshot(collection(db, "subscriptions"), (snapshot) => {
      const updated = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubscriptions(updated);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const userRef = doc(db, "subscriptions", newSubscriber.userId);
      const existingUser = subscriptions.find(
        (sub) => sub.id === newSubscriber.userId
      );

      if (newSubscriber.courseType === "paid") {
        const existingDetails = existingUser?.DETAILS || [];
        const courseKey = newSubscriber.course;

        const alreadyExists = existingDetails.some(
          (detail) => detail[courseKey]
        );

        if (alreadyExists) {
          setErrorMessage("User already subscribed to this course.");
          return;
        }

        const newEntry = {
          [courseKey]: {
            subscriptionDate: new Date(
              newSubscriber.subscriptionDate
            ).toISOString(),
            expiryDate: new Date(newSubscriber.expiryDate).toISOString(),
            status: newSubscriber.status,
          },
        };

        await setDoc(
          userRef,
          { DETAILS: [...existingDetails, newEntry] },
          { merge: true }
        );
      } else {
        const existingFree = existingUser?.freecourses || [];
        if (!existingFree.includes(newSubscriber.course)) {
          existingFree.push(newSubscriber.course);
        }
        await setDoc(userRef, { freecourses: existingFree }, { merge: true });
      }

      setSuccessMessage("Subscriber added successfully!");
      setNewSubscriber({
        userId: "",
        course: "",
        courseType: "paid",
        status: "active",
        subscriptionDate: today,
        expiryDate: expiry,
      });
    } catch (err) {
      setErrorMessage("Error adding subscriber: " + err.message);
    }
  };

  const handleDeleteCourse = async (userId, courseName) => {
    const userRef = doc(db, "subscriptions", userId);
    const userSub = subscriptions.find((sub) => sub.id === userId);

    if (!userSub || !courseName) return;

    if (
      window.confirm(
        `Are you sure you want to remove "${courseName}" for user "${userId}"?`
      )
    ) {
      if (userSub.DETAILS?.some((d) => Object.keys(d)[0] === courseName)) {
        const updated = userSub.DETAILS.filter(
          (d) => Object.keys(d)[0] !== courseName
        );
        await updateDoc(userRef, { DETAILS: updated });
      }

      if (userSub.freecourses?.includes(courseName)) {
        const updatedFree = userSub.freecourses.filter((c) => c !== courseName);
        await updateDoc(userRef, { freecourses: updatedFree });
      }
    }
  };

  const filteredSubscribers =
    selectedCourse !== ""
      ? subscriptions.filter((sub) => {
          const paid = sub.DETAILS?.map((c) => Object.keys(c)[0]) || [];
          const free = sub.freecourses || [];
          return paid.includes(selectedCourse) || free.includes(selectedCourse);
        })
      : subscriptions;

  const handleExpand = () => {
    setExpend(!expend);
  };

  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-white ">
      <div className="bg-white shadow-md">
        <Admin />
      </div>

      <div className="pt-16 flex flex-col items-center w-full">
        <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md w-full md:w-4/5 ">
          <h2 className="text-2xl font-bold text-red-600 flex justify-between mb-4">
            Add New Subscriber
            <button onClick={handleExpand} className="text-xl transition-all  ">
              {expend ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
          </h2>
          {expend && (
            <form
              onSubmit={handleAddSubscriber}
              className="space-y-4 transition-all duration-300 "
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4  ">
                {/* Email/User ID Field */}
                <div>
                  <label
                    htmlFor="userId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email/User ID
                  </label>
                  <input
                    id="userId"
                    type="text"
                    required
                    placeholder="Email/User ID"
                    value={newSubscriber.userId}
                    onChange={(e) =>
                      setNewSubscriber({
                        ...newSubscriber,
                        userId: e.target.value,
                      })
                    }
                    className="block p-2 w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                {/* Course Type Selection */}
                <div>
                  <label
                    htmlFor="courseType"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Course Type
                  </label>
                  <select
                    id="courseType"
                    value={newSubscriber.courseType}
                    onChange={(e) =>
                      setNewSubscriber({
                        ...newSubscriber,
                        courseType: e.target.value,
                      })
                    }
                    className="block p-2 w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="paid">Paid Course</option>
                    <option value="free">Free Course</option>
                  </select>
                </div>

                {/* Course Selection */}
                <div>
                  <label
                    htmlFor="course"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Course
                  </label>
                  <select
                    id="course"
                    required
                    value={newSubscriber.course}
                    onChange={(e) =>
                      setNewSubscriber({
                        ...newSubscriber,
                        course: e.target.value,
                      })
                    }
                    className="block w-full rounded-md p-2 border-gray-300 shadow-sm"
                  >
                    <option value="">Select Course</option>
                    {newSubscriber.courseType === "paid"
                      ? courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.id}
                          </option>
                        ))
                      : freeCourses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Error and Success Messages */}
              {errorMessage && (
                <p className="text-red-600 text-sm">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="text-green-600 text-sm">{successMessage}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Add Subscriber
              </button>
            </form>
          )}
        </div>

        <div className="w-full md:w-4/5 ">
          <h1 className="text-3xl font-bold text-red-600 mb-4 text-center ">
            Enrolled Users
          </h1>

          <div className="mb-6 max-w-auto">
            <label className="block mb-2 font-medium text-gray-700">
              Filter by Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="p-2 w-full border border-gray-300 rounded"
            >
              <option value="">All Courses</option>
              {allCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="md:flex items-center justify-between">
            {!selectedCourse && (
              <p className="text-md text-red-500 mt-1 p-2">
                Select a course to enable delete
              </p>
            )}
            <div className="flex flex-row items-center justify-between">
            <p className="text-right p-2" >
              Total Subscribers:{" "}
              <strong className="bg-green-500 text-white px-3 py-1 rounded ">
                {filteredSubscribers.length}
              </strong>
            </p>
            </div>
            
            </div>

            <div className="overflow-y-auto my-4 mb-16 max-h-[30rem] hidden md:block md:w-auto border border-gray-800 rounded">
              <table className="w-full text-left table-auto">
                <thead className="bg-pink-100 sticky top-0 z-10">
                  <tr>
                    <th className="border px-4 py-2">Name</th>
                    <th className="border px-4 py-2">User ID</th>
                    <th className="border px-4 w-52 py-2">Phone</th>
                    <th className="border px-6 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.length > 0 ? (
                    filteredSubscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td className="border px-4 py-2">
                          {sub.name || "N/A"}
                        </td>
                        <td className="border px-4 py-2">{sub.id}</td>
                        <td className="border px-4 py-2">
                          {sub.phone || "N/A"}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            disabled={!selectedCourse}
                            onClick={() =>
                              selectedCourse &&
                              handleDeleteCourse(sub.id, selectedCourse)
                            }
                            className={`${
                              !selectedCourse
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/6861/6861362.png"
                              className="h-6"
                              alt="Delete"
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-2">
                        No subscribers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card layout for small screens */}
          <div className="space-y-4 md:hidden">
            {filteredSubscribers.length > 0 ? (
              filteredSubscribers.map((sub) => (
                <div
                  key={sub.id}
                  className="border rounded-lg shadow p-4 bg-white"
                >
                  <p className="mb-2">
                    <span className="font-semibold">Name:</span>{" "}
                    {sub.name || "N/A"}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">User ID:</span> {sub.id}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Phone:</span>{" "}
                    {sub.phone || "N/A"}
                  </p>
                  <div className="text-right">
                    <button
                      onClick={() => handleDeleteCourse(sub.id, selectedCourse)}
                      className={`${
                        !selectedCourse
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/6861/6861362.png"
                        className="h-6 inline-block"
                        alt="Delete"
                      />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">
                No subscribers found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrolledUsers;
