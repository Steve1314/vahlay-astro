import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, storage } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const AddModule = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [videoModules, setVideoModules] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialFile, setNewMaterialFile] = useState(null);

  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [materialUploadProgress, setMaterialUploadProgress] = useState(0);

  const [editVideo, setEditVideo] = useState(null);
  const [editMaterial, setEditMaterial] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);



  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
        const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));

        const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || `Untitled (ID: ${doc.id})`,
        }));
        const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title || `Untitled (ID: ${doc.id})`,
        }));

        setCourses([...freeCourses, ...paidCourses]);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const fetchModules = async () => {
        try {
          const videosSnapshot = await getDocs(collection(db, `videos_${selectedCourse}`));
          const materialsSnapshot = await getDocs(collection(db, `materials_${selectedCourse}`));

          const videoModules = videosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          const studyMaterials = materialsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          setVideoModules(videoModules);
          setStudyMaterials(studyMaterials);
        } catch (error) {
          console.error("Error fetching modules:", error);
        }
      };

      fetchModules();
    } else {
      setVideoModules([]);
      setStudyMaterials([]);
    }
  }, [selectedCourse]);

  const handleUpload = async (title, file, type) => {
    try {
      const storageRef = ref(storage, `${type}/${selectedCourse}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (type === "videos") {
            setVideoUploadProgress(progress);
          } else {
            setMaterialUploadProgress(progress);
          }
        },
        (error) => {
          console.error("File upload failed:", error);
        },
        async () => {
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const collectionRef = collection(db, `${type}_${selectedCourse}`);
          await addDoc(collectionRef, { title, url: fileUrl });
          alert("Uploaded successfully");

          if (type === "videos") {
            setVideoModules([...videoModules, { title, url: fileUrl }]);
            setVideoUploadProgress(0);
          } else {
            setStudyMaterials([...studyMaterials, { title, url: fileUrl }]);
            setMaterialUploadProgress(0);
          }
        }
      );
    } catch (error) {
      console.error("Error uploading:", error);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      await deleteDoc(doc(db, `${type}_${selectedCourse}`, id));
      if (type === "videos") {
        setVideoModules(videoModules.filter((module) => module.id !== id));
      } else {
        setStudyMaterials(studyMaterials.filter((material) => material.id !== id));
      }
      alert("Deleted successfully");
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleEdit = async (id, updatedTitle, file, type) => {
    try {
      let fileUrl = null;

      if (file) {
        const storageRef = ref(storage, `${type}/${selectedCourse}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          () => { },
          (error) => {
            console.error("File upload failed:", error);
          },
          async () => {
            fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const updatedData = { title: updatedTitle };

            if (fileUrl) updatedData.url = fileUrl;

            await updateDoc(doc(db, `${type}_${selectedCourse}`, id), updatedData);
            alert("Updated successfully");
            setEditVideo(null);
            setEditMaterial(null);
          }
        );
      } else {
        await updateDoc(doc(db, `${type}_${selectedCourse}`, id), { title: updatedTitle });
        alert("Updated successfully");
        setEditVideo(null);
        setEditMaterial(null);
      }
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  return (
    <div className="flex flex-col  md:flex-row  min-h-screen bg-gray-100">

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



      <div className="flex-1 p-4 mt-16 md:mt-0">


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

        <div className="my-4">
          <label className="block font-medium">Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select a Course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold">Upload New Video Session</h2>
          <input
            type="text"
            placeholder="Video Title"
            value={newVideoTitle}
            onChange={(e) => setNewVideoTitle(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="file"
            onChange={(e) => setNewVideoFile(e.target.files[0])}
            className="mb-2"
          />
          {videoUploadProgress > 0 && (
            <div className="mb-2">
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${videoUploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{Math.round(videoUploadProgress)}% uploaded</p>
            </div>
          )}
          <button
            onClick={() => handleUpload(newVideoTitle, newVideoFile, "videos")}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Upload Video
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold">Upload New Study Material</h2>
          <input
            type="text"
            placeholder="Material Title"
            value={newMaterialTitle}
            onChange={(e) => setNewMaterialTitle(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="file"
            onChange={(e) => setNewMaterialFile(e.target.files[0])}
            className="mb-2"
          />
          {materialUploadProgress > 0 && (
            <div className="mb-2">
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${materialUploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{Math.round(materialUploadProgress)}% uploaded</p>
            </div>
          )}
          <button
            onClick={() => handleUpload(newMaterialTitle, newMaterialFile, "materials")}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Upload Material
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold">Video Sessions</h2>
          {videoModules.map((module) => (
            <div key={module.id} className="p-4 border rounded mb-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="font-bold">{module.title}</h3>
                  <a href={module.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a>
                </div>
                <div className="mt-2 md:mt-0">
                  <button
                    onClick={() => setEditVideo(module)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(module.id, "videos")}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {editVideo && editVideo.id === module.id && (
                <div className="mt-4">
                  <input
                    type="text"
                    defaultValue={module.title}
                    onChange={(e) => (module.title = e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="file"
                    onChange={(e) => (module.newFile = e.target.files[0])}
                    className="mb-2"
                  />
                  <button
                    onClick={() => handleEdit(module.id, module.title, module.newFile, "videos")}
                    className="bg-green-500 text-white px-4 py-2 rounded w-full"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold">Study Materials</h2>
          {studyMaterials.map((material) => (
            <div key={material.id} className="p-4 border rounded mb-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="font-bold">{material.title}</h3>
                  <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View</a>
                </div>
                <div className="mt-2 md:mt-0">
                  <button
                    onClick={() => setEditMaterial(material)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(material.id, "materials")}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {editMaterial && editMaterial.id === material.id && (
                <div className="mt-4">
                  <input
                    type="text"
                    defaultValue={material.title}
                    onChange={(e) => (material.title = e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="file"
                    onChange={(e) => (material.newFile = e.target.files[0])}
                    className="mb-2"
                  />
                  <button
                    onClick={() => handleEdit(material.id, material.title, material.newFile, "materials")}
                    className="bg-green-500 text-white px-4 py-2 rounded w-full"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddModule;
