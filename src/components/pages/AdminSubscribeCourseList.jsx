import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc, Timestamp, setDoc } from "firebase/firestore";
import Admin from "./Admin";

const AdminEnrolledUsers = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  // Paid course editing states
  const [editingCourseData, setEditingCourseData] = useState({
    userId: null,
    oldCourseName: '',
    newCourseName: '',
    subscriptionDate: '',
    expiryDate: ''
  });

  // Free course editing states
  const [editingFreeCourse, setEditingFreeCourse] = useState({
    userId: null,
    index: null,
    newCourseName: ''
  });


  const [newSubscriber, setNewSubscriber] = useState({
    userId: '',
    course: '',
    courseType: 'paid',
    status: 'active',
    subscriptionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [freeCourses, setFreeCourses] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  // useEffect(() => {
  //   const coursesCollection = collection(db, 'paidCourses');
  //   const unsubscribe = onSnapshot(coursesCollection, (snapshot) => {
  //     const coursesData = snapshot.docs.map(doc => ({ id: doc.id }));
  //     setCourses(coursesData);
  //   });
  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "subscriptions"), (snapshot) => {
      const updatedSubscriptions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubscriptions(updatedSubscriptions);
    });
    return () => unsubscribe();
  }, []);

  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = expiryDate instanceof Timestamp ? expiryDate.toDate() : new Date(expiryDate);
    const difference = expiry - today;
    return Math.max(Math.ceil(difference / (1000 * 60 * 60 * 24)), 0);
  };



  useEffect(() => {
    // Fetch paid courses
    const coursesCollection = collection(db, 'paidCourses');
    const unsubscribePaid = onSnapshot(coursesCollection, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id }));
      setCourses(coursesData);
    });

    // Fetch free courses
    const freeCoursesCollection = collection(db, 'freeCourses');
    const unsubscribeFree = onSnapshot(freeCoursesCollection, (snapshot) => {
      const freeCoursesData = snapshot.docs.map(doc => doc.id);
      setFreeCourses(freeCoursesData);
    });

    // Fetch subscriptions
    const unsubscribeSubscriptions = onSnapshot(collection(db, "subscriptions"), (snapshot) => {
      const updatedSubscriptions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubscriptions(updatedSubscriptions);
    });

    return () => {
      unsubscribePaid();
      unsubscribeFree();
      unsubscribeSubscriptions();
    };
  }, []);

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const userRef = doc(db, "subscriptions", newSubscriber.userId);
      const existingUser = subscriptions.find(sub => sub.id === newSubscriber.userId);

      if (newSubscriber.courseType === 'paid') {
        const existingDetails = existingUser?.DETAILS ? [...existingUser.DETAILS] : [];

        console.log("Existing Details Before Update:", existingDetails);

        const newCourseEntry = {
          [newSubscriber.course]: {
            subscriptionDate: new Date(newSubscriber.subscriptionDate).toISOString(), // Store as ISO string
            expiryDate: new Date(newSubscriber.expiryDate).toISOString(), // Store as ISO string
            status: newSubscriber.status
          }
        };

        console.log("New Course Entry:", newCourseEntry);

        await setDoc(userRef, {
          DETAILS: [...existingDetails, newCourseEntry]
        }, { merge: true });

      } else {
        const existingFreeCourses = existingUser?.freecourses ? [...existingUser.freecourses] : [];
        if (!existingFreeCourses.includes(newSubscriber.course)) {
          existingFreeCourses.push(newSubscriber.course);
        }

        await setDoc(userRef, {
          freecourses: existingFreeCourses
        }, { merge: true });
      }

      console.log("Updated Firestore Document:", newSubscriber.userId);

      setSuccessMessage('Subscriber added successfully!');
      setNewSubscriber({
        userId: '',
        course: '',
        courseType: 'paid',
        status: 'active',
        subscriptionDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } catch (error) {
      setErrorMessage('Error adding subscriber: ' + error.message);
      console.error("Firestore Error:", error);
    }
  };




  const formatDate = (date) => {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const toggleUserDetails = (userId) => {
    setExpandedUser((prevUserId) => (prevUserId === userId ? null : userId));
  };

  const toggleSection = (section) => {
    setExpandedSection((prevSection) => (prevSection === section ? null : section));
  };

  const handleUpdateCourse = async () => {
    const { userId, oldCourseName, newCourseName, subscriptionDate, expiryDate } = editingCourseData;
    const userRef = doc(db, "subscriptions", userId);
    const userSub = subscriptions.find(sub => sub.id === userId);

    if (!userSub || !userSub.DETAILS) return;

    console.log("Before Update - Existing Details:", userSub.DETAILS);

    const updatedDetails = userSub.DETAILS.map(course => {
      const currentCourseName = Object.keys(course)[0];
      if (currentCourseName === oldCourseName) {
        return {
          [newCourseName]: {
            subscriptionDate: new Date(subscriptionDate).toISOString(), // Ensure ISO format
            expiryDate: new Date(expiryDate).toISOString(), // Ensure ISO format
            status: course[oldCourseName]?.status || "active" // Preserve status
          }
        };
      }
      return course;
    });

    console.log("After Update - New Details:", updatedDetails);

    await updateDoc(userRef, { DETAILS: updatedDetails });

    setEditingCourseData({
      userId: null,
      oldCourseName: '',
      newCourseName: '',
      subscriptionDate: '',
      expiryDate: ''
    });
  };


  const handleUpdateFreeCourse = async () => {
    const { userId, index, newCourseName } = editingFreeCourse;
    if (!newCourseName.trim()) return;

    const userRef = doc(db, "subscriptions", userId);
    const userSub = subscriptions.find(sub => sub.id === userId);
    const updatedFreeCourses = [...userSub.freecourses];
    updatedFreeCourses[index] = newCourseName.trim();

    await updateDoc(userRef, { freecourses: updatedFreeCourses });
    setEditingFreeCourse({ userId: null, index: null, newCourseName: '' });
  };

  const deleteCourse = async (userId, courseName) => {
    const userRef = doc(db, "subscriptions", userId);
    const updatedDetails = subscriptions
      .find((sub) => sub.id === userId)
      .DETAILS.filter((course) => Object.keys(course)[0] !== courseName);

    await updateDoc(userRef, { DETAILS: updatedDetails });
  };

  // Categorizing Users with proper length checks
  const paidUsers = subscriptions.filter((sub) =>
    sub.DETAILS?.length > 0 && !sub.freecourses?.length
  );
  const freeUsers = subscriptions.filter((sub) =>
    sub.freecourses?.length > 0 && !sub.DETAILS?.length
  );
  const bothUsers = subscriptions.filter((sub) =>
    sub.DETAILS?.length > 0 && sub.freecourses?.length > 0
  );

  return (
    <div className="flex flex-row md:flex-row min-h-screen bg-white">
      <div className="w-full md:w-1/4 bg-white shadow-md">
        <Admin />
      </div>

      <div>
        {/* Add Subscriber Section */}
        <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Add New Subscriber</h2>
          <form onSubmit={handleAddSubscriber} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email ID</label>
                <input
                  type="text"
                  required
                  value={newSubscriber.userId}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, userId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Course Type</label>
                <select
                  value={newSubscriber.courseType}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, courseType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                >
                  <option value="paid">Paid Course</option>
                  <option value="free">Free Course</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {newSubscriber.courseType === 'paid' ? 'Paid Course' : 'Free Course'}
                </label>
                <select
                  required
                  value={newSubscriber.course}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, course: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                >
                  <option value="">Select Course</option>
                  {newSubscriber.courseType === 'paid'
                    ? courses.map(course => (
                      <option key={course.id} value={course.id}>{course.id}</option>
                    ))
                    : freeCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                </select>
              </div>
            </div>

            {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
            {successMessage && <p className="text-red-600 text-sm">{successMessage}</p>}

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Add Subscriber
            </button>
          </form>
        </section>


        <div className="w-full md:w-3/4 px-4 sm:px-6 py-8 mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
            Enrolled Users
          </h1>

          {/* Users Subscribed to Both */}
          <section className="mb-8 w-full">
            <div
              className="cursor-pointer flex justify-between items-center bg-red-600 text-white p-3 rounded-lg w-full"
              onClick={() => toggleSection("both")}
            >
              <h2 className="text-lg md:text-xl font-bold">Users Subscribed to Both</h2>
              <span>{expandedSection === "both" ? "▲" : "▼"}</span>
            </div>
            {expandedSection === "both" && (
              <ul className="mt-4 space-y-4 w-full">
                {bothUsers.map((user, index) => (
                  <li key={user.id} className="border border-gray-300 rounded-lg p-4 bg-white shadow-md w-full">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleUserDetails(user.id)}>
                      <h2 className="text-sm md:text-lg font-semibold text-red-600">
                        {index + 1}. {user.id}
                      </h2>
                      <button className="text-gray-600 hover:text-red-600 text-sm md:text-base">
                        {expandedUser === user.id ? "Hide Details" : "Show Details"}
                      </button>
                    </div>

                    {expandedUser === user.id && (
                      <div className="mt-4 space-y-2">
                        {/* Paid Courses */}
                        {user.DETAILS?.map((course, idx) => {
                          const courseName = Object.keys(course)[0];
                          const isEditing = editingCourseData.userId === user.id &&
                            editingCourseData.oldCourseName === courseName;

                          return (
                            <div key={idx} className="border-t border-gray-200 pt-2 text-gray-700 text-sm">
                              {!isEditing ? (
                                <>
                                  <p><span className="font-medium">Course:</span> {courseName}</p>
                                  <p><span className="font-medium">Subscription Date:</span>
                                    {formatDate(course[courseName].subscriptionDate)}
                                  </p>
                                  <p><span className="font-medium">Expiry Date:</span>
                                    {formatDate(course[courseName].expiryDate)}
                                  </p>
                                  <p><span className="font-medium">Days Left:</span>
                                    {calculateDaysLeft(course[courseName].expiryDate)}
                                  </p>
                                  <div className="mt-2">
                                    <button
                                      className="text-white bg-red-600 px-3 py-1 rounded-lg"
                                      onClick={() => deleteCourse(user.id, courseName)}
                                    >
                                      Delete
                                    </button>
                                    <button
                                      className="ml-2 text-white bg-red-600 px-3 py-1 rounded-lg"
                                      onClick={() => {
                                        const courseData = course[courseName];
                                        const getDateValue = (date) => {
                                          if (date instanceof Timestamp) {
                                            return date.toDate().toISOString().split('T')[0];
                                          }
                                          return new Date(date).toISOString().split('T')[0];
                                        };

                                        setEditingCourseData({
                                          userId: user.id,
                                          oldCourseName: courseName,
                                          newCourseName: courseName,
                                          subscriptionDate: getDateValue(courseData.subscriptionDate),
                                          expiryDate: getDateValue(courseData.expiryDate)
                                        });
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="mt-2 space-y-2">
                                  <select
                                    value={editingCourseData.newCourseName}
                                    onChange={(e) => setEditingCourseData(prev => ({
                                      ...prev,
                                      newCourseName: e.target.value
                                    }))}
                                    className="border p-2 rounded w-full"
                                  >
                                    {courses.map((course) => (
                                      <option key={course.id} value={course.id}>
                                        {course.id}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="date"
                                    value={editingCourseData.subscriptionDate}
                                    onChange={(e) => setEditingCourseData(prev => ({
                                      ...prev,
                                      subscriptionDate: e.target.value
                                    }))}
                                    className="border p-2 rounded w-full"
                                  />
                                  <input
                                    type="date"
                                    value={editingCourseData.expiryDate}
                                    onChange={(e) => setEditingCourseData(prev => ({
                                      ...prev,
                                      expiryDate: e.target.value
                                    }))}
                                    className="border p-2 rounded w-full"
                                  />
                                  <div className="flex space-x-2 mt-2">
                                    <button
                                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                                      onClick={handleUpdateCourse}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                                      onClick={() => setEditingCourseData({
                                        userId: null,
                                        oldCourseName: '',
                                        newCourseName: '',
                                        subscriptionDate: '',
                                        expiryDate: ''
                                      })}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Free Courses - Correctly nested */}
                        {user.freecourses?.length > 0 && (
                          <div>
                            <h3 className="font-bold text-gray-800 mt-4">Free Courses:</h3>
                            <ul className="list-disc list-inside text-gray-700">
                              {user.freecourses.map((course, idx) => {
                                const isEditing = editingFreeCourse.userId === user.id &&
                                  editingFreeCourse.index === idx;

                                return (
                                  <li key={idx} className="mt-1">
                                    {!isEditing ? (
                                      <div className="flex items-center">
                                        <span>{course}</span>
                                        <button
                                          className="ml-2 text-red-600 text-sm"
                                          onClick={() => setEditingFreeCourse({
                                            userId: user.id,
                                            index: idx,
                                            newCourseName: course
                                          })}
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="text"
                                          value={editingFreeCourse.newCourseName}
                                          onChange={(e) => setEditingFreeCourse(prev => ({
                                            ...prev,
                                            newCourseName: e.target.value
                                          }))}
                                          className="border p-1 rounded flex-1"
                                        />
                                        <button
                                          className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                                          onClick={handleUpdateFreeCourse}
                                        >
                                          Save
                                        </button>
                                        <button
                                          className="bg-gray-600 text-white px-2 py-1 rounded text-sm"
                                          onClick={() => setEditingFreeCourse({
                                            userId: null,
                                            index: null,
                                            newCourseName: ''
                                          })}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Paid Course Users */}
          <section className="mb-8 w-full">
            <div
              className="cursor-pointer flex justify-between items-center bg-red-600 text-white p-3 rounded-lg w-full"
              onClick={() => toggleSection("paid")}
            >
              <h2 className="text-lg md:text-xl font-bold">Paid Course Users</h2>
              <span>{expandedSection === "paid" ? "▲" : "▼"}</span>
            </div>
            {expandedSection === "paid" && (
              <ul className="mt-4 space-y-4 w-full">
                {paidUsers.map((user, index) => (
                  <li key={user.id} className="border border-gray-300 rounded-lg p-4 bg-white shadow-md w-full">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleUserDetails(user.id)}>
                      <h2 className="text-sm md:text-lg font-semibold text-red-600">
                        {index + 1}. {user.id}
                      </h2>
                      <button className="text-gray-600 hover:text-red-600 text-sm md:text-base">
                        {expandedUser === user.id ? "Hide Details" : "Show Details"}
                      </button>
                    </div>

                    {expandedUser === user.id && user.DETAILS?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {user.DETAILS.map((course, idx) => {
                          const courseName = Object.keys(course)[0];
                          const isEditing = editingCourseData.userId === user.id &&
                            editingCourseData.oldCourseName === courseName;

                          return (
                            <div key={idx} className="border-t border-gray-200 pt-2 text-gray-700 text-sm">
                              {!isEditing ? (
                                <>
                                  <p><span className="font-medium">Course:</span> {courseName}</p>
                                  <p><span className="font-medium">Subscription Date:</span>
                                    {formatDate(course[courseName].subscriptionDate)}
                                  </p>
                                  <p><span className="font-medium">Expiry Date:</span>
                                    {formatDate(course[courseName].expiryDate)}
                                  </p>
                                  <p><span className="font-medium">Days Left:</span>
                                    {calculateDaysLeft(course[courseName].expiryDate)}
                                  </p>
                                  <div className="mt-2">
                                    <button
                                      className="text-white bg-red-600 px-3 py-1 rounded-lg"
                                      onClick={() => deleteCourse(user.id, courseName)}
                                    >
                                      Delete
                                    </button>
                                    <button
                                      className="ml-2 text-white bg-red-600 px-3 py-1 rounded-lg"
                                      onClick={() => {
                                        const courseData = course[courseName];
                                        const getDateValue = (date) => {
                                          if (date instanceof Timestamp) {
                                            return date.toDate().toISOString().split('T')[0];
                                          }
                                          return new Date(date).toISOString().split('T')[0];
                                        };

                                        setEditingCourseData({
                                          userId: user.id,
                                          oldCourseName: courseName,
                                          newCourseName: courseName,
                                          subscriptionDate: getDateValue(courseData.subscriptionDate),
                                          expiryDate: getDateValue(courseData.expiryDate)
                                        });
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="mt-2 space-y-2">
                                  <select
                                    value={editingCourseData.newCourseName}
                                    onChange={(e) => setEditingCourseData(prev => ({
                                      ...prev,
                                      newCourseName: e.target.value
                                    }))}
                                    className="border p-2 rounded w-full"
                                  >
                                    {courses.map((course) => (
                                      <option key={course.id} value={course.id}>
                                        {course.id}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="date"
                                    value={editingCourseData.subscriptionDate}
                                    onChange={(e) => setEditingCourseData(prev => ({
                                      ...prev,
                                      subscriptionDate: e.target.value
                                    }))}
                                    className="border p-2 rounded w-full"
                                  />
                                  <input
                                    type="date"
                                    value={editingCourseData.expiryDate}
                                    onChange={(e) => setEditingCourseData(prev => ({
                                      ...prev,
                                      expiryDate: e.target.value
                                    }))}
                                    className="border p-2 rounded w-full"
                                  />
                                  <div className="flex space-x-2 mt-2">
                                    <button
                                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                                      onClick={handleUpdateCourse}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                                      onClick={() => setEditingCourseData({
                                        userId: null,
                                        oldCourseName: '',
                                        newCourseName: '',
                                        subscriptionDate: '',
                                        expiryDate: ''
                                      })}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Free Course Users */}
          <section className="mb-8 w-full">
            <div
              className="cursor-pointer flex justify-between items-center bg-red-600 text-white p-3 rounded-lg w-full"
              onClick={() => toggleSection("free")}
            >
              <h2 className="text-lg md:text-xl font-bold">Free Course Users</h2>
              <span>{expandedSection === "free" ? "▲" : "▼"}</span>
            </div>

            {expandedSection === "free" && (
              <ul className="mt-4 space-y-4 w-full">
                {freeUsers.map((user, index) => (
                  <li key={user.id} className="border border-gray-300 rounded-lg p-4 bg-white shadow-md w-full">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleUserDetails(user.id)}>
                      <h2 className="text-sm md:text-lg font-semibold text-red-600">
                        {index + 1}. {user.id}
                      </h2>
                      <button className="text-gray-600 hover:text-red-600 text-sm md:text-base">
                        {expandedUser === user.id ? "Hide Details" : "Show Details"}
                      </button>
                    </div>

                    {expandedUser === user.id && user.freecourses?.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-gray-800">Free Courses:</p>
                        <ul className="list-disc list-inside text-gray-700">
                          {user.freecourses.map((course, idx) => {
                            const isEditing = editingFreeCourse.userId === user.id && editingFreeCourse.index === idx;
                            return (
                              <li key={idx} className="mt-1">
                                {!isEditing ? (
                                  <div className="flex items-center">
                                    <span>{course}</span>
                                    <button
                                      className="ml-2 text-red-600 text-sm"
                                      onClick={() => setEditingFreeCourse({
                                        userId: user.id,
                                        index: idx,
                                        newCourseName: course
                                      })}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={editingFreeCourse.newCourseName}
                                      onChange={(e) => setEditingFreeCourse(prev => ({
                                        ...prev,
                                        newCourseName: e.target.value
                                      }))}
                                      className="border p-1 rounded flex-1"
                                    />
                                    <button
                                      className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                                      onClick={handleUpdateFreeCourse}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="bg-gray-600 text-white px-2 py-1 rounded text-sm"
                                      onClick={() => setEditingFreeCourse({
                                        userId: null,
                                        index: null,
                                        newCourseName: ''
                                      })}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrolledUsers;