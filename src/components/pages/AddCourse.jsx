import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebaseConfig";
import { serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseSubTitle, setCourseSubTitle] = useState("");

  const [courseType, setCourseType] = useState("free");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state
  const [currentSection, setCurrentSection] = useState("articles");

  const storage = getStorage();

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
      const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));
      const allCourses = [
        ...freeCoursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ...paidCoursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ];
      setCourses(allCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddOrUpdateCourse = async () => {
    if (!courseTitle || !courseSubTitle || !description || (!imageFile && !editingCourseId)) {
      alert("Course title, description, and image are required");
      return;
    }

    try {
      setIsUploading(true);

      let imageUrl = null;

      if (imageFile) {
        const imageRef = ref(storage, `course-images/${courseTitle}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const courseData = {
        title: courseTitle,
        Subtitle: courseSubTitle,
        type: courseType,
        description,
        imageUrl: imageUrl || (courses.find((c) => c.id === editingCourseId)?.imageUrl || ""),
      };

      if (!editingCourseId) {
        courseData.createdAt = serverTimestamp();
      }

      if (courseType === "paid") {
        if (!price) {
          alert("Price is required for paid courses");
          return;
        }
        courseData.price = parseFloat(price);
        courseData.status = status;
      }

      const collectionName = courseType === "free" ? "freeCourses" : "paidCourses";
      const courseDocRef = doc(db, collectionName, editingCourseId || courseTitle);
      await setDoc(courseDocRef, courseData, { merge: true });

      alert(editingCourseId ? "Course updated successfully" : "Course added successfully");
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error("Error adding or updating course:", error);
      alert("Failed to save course. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCourse = async (id, type) => {
    try {
      const collectionName = type === "free" ? "freeCourses" : "paidCourses";
      await deleteDoc(doc(db, collectionName, id));
      alert("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
    }
  };

  const handleEditCourse = (course) => {
    setCourseTitle(course.title);
    setCourseSubTitle(course.Subtitle);

    setDescription(course.description);
    setCourseType(course.type);
    setPrice(course.price || "");
    setStatus(course.status || "active");
    setEditingCourseId(course.id);
    setIsFormVisible(true); // Open the form for editing
  };

  const resetForm = () => {
    setCourseTitle("");
    setCourseSubTitle("");

    setDescription("");
    setCourseType("free");
    setPrice("");
    setStatus("active");
    setImageFile(null);
    setEditingCourseId(null);
    setIsFormVisible(false); // Close the form after submission
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}

      {/* Sidebar */}
      <aside
        className={`w-full h-screen md:w-1/6 bg-red-600 text-white p-4 shadow-lg transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } md:relative fixed top-0 left-0 z-10`}
      >
        <div className="flex justify-between items-center mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-2xl font-bold"
          >
            ✖
          </button>
        </div>
        <ul className="mt-4">


          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/adminarticle">Articles</Link>
            </li>
          </div>



          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/admincalendar">Calendar</Link>
            </li>
          </div>

          <div>
            <li className="p-2 hover:bg-white hover:text-red-600 rounded">
              <Link to="/adminsubscribecourselist">Subscribe List</Link>
            </li>
          </div>



          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/addcourse">Add Course</Link>
            </li>
          </div>
          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/addmodule">Add Module</Link>
            </li>
          </div>
          {/* <div>
           <li className="p-2 hover:bg-blue-100"><Link to="/adminlivesession">Add Live Session </Link></li>
         </div> */}
          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/addmeeting">Add Live Session</Link>
            </li>
          </div>
          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/admin/addemi">Add Emi Plans</Link>
            </li>
          </div>
          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <Link to="/admin/emailuserlist">Track Emi Plans</Link>
            </li>
          </div>

          <div>
            <li className="p-2 transition-colors duration-200 hover:bg-white hover:text-red-600">
              <a href="/payment">Payment List</a>
            </li>
          </div>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Menu Icon */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden bg-red-500 text-white p-2 mb-4 rounded flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>




        {isFormVisible && (
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              {editingCourseId ? "Edit Course" : "Add New Course"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Course Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Course Subtitle</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={courseSubTitle}
                  onChange={(e) => setCourseSubTitle(e.target.value)}
                  placeholder="Enter course Sub title"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Course Type</label>
                <select
                  className="w-full px-4 py-3 border border-red-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {courseType === "paid" && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Price</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter course price"
                  />
                </div>
              )}
              {courseType === "paid" && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter course description"
                rows="4"
              ></textarea>
            </div>
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2">Course Image</label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-gray-700 border border-gray-300 rounded-lg cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleAddOrUpdateCourse}
                className={`w-full md:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition ${isUploading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                disabled={isUploading}
              >
                {isUploading ? "Saving..." : editingCourseId ? "Update Course" : "Add Course"}
              </button>
            </div>
          </div>
        )}
        <div className="text-left mb-6">
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition"
          >
            {isFormVisible ? "X" : "Add New Course"}
          </button>

        </div>
        <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 text-center">Courses</h2>
        <ul className="divide-y divide-gray-200">
          {courses.map((course) => (
            <li
              key={course.id}
              className="py-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <span className="text-lg text-gray-800 font-medium">{course.title}</span>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleEditCourse(course)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id, course.type)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddCourse;
