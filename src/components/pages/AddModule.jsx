import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Admin from "./Admin";
import { db, storage } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
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
  const [newVideoDescription, setNewVideoDescription] = useState("");
  const [uploading, setUploading] = useState(false); // Track upload status
  const [uploadTask, setUploadTask] = useState(null); // Track ongoing upload

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

  const handleUpload = async (title, description, file, type) => {
    try {
      if (!file) {
        alert("Please select a file to upload.");
        return;
      }

      setUploading(true);
      const storageRef = ref(storage, `${type}/${selectedCourse}/${Date.now()}_${file.name}`);
      const uploadTaskInstance = uploadBytesResumable(storageRef, file);
      setUploadTask(uploadTaskInstance); // Store upload task to allow cancellation

      uploadTaskInstance.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setVideoUploadProgress(progress);
        },
        (error) => {
          console.error("File upload failed:", error);
          setUploading(false);
        },
        async () => {
          const fileUrl = await getDownloadURL(uploadTaskInstance.snapshot.ref);
          const collectionRef = collection(db, `${type}_${selectedCourse}`);

          await addDoc(collectionRef, { title, description, url: fileUrl });
          alert("Uploaded successfully");

          setVideoModules([...videoModules, { title, description, url: fileUrl }]);
          setVideoUploadProgress(0);
          setUploading(false);
        }
      );
    } catch (error) {
      console.error("Error uploading:", error);
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel(); // Cancel Firebase upload
      setUploadTask(null);
      setUploading(false);
      setVideoUploadProgress(0);
      alert("Upload canceled.");
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

  const handleEdit = async (id, updatedTitle, updatedDescription, file, type) => {
    try {
      let fileUrl = null;

      if (file) {
        const storageRef = ref(storage, `${type}/${selectedCourse}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          () => {},
          (error) => {
            console.error("File upload failed:", error);
          },
          async () => {
            fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const updatedData = { title: updatedTitle, description: updatedDescription };

            if (fileUrl) updatedData.url = fileUrl;

            await updateDoc(doc(db, `${type}_${selectedCourse}`, id), updatedData);
            alert("Updated successfully");
            setEditVideo(null);
          }
        );
      } else {
        await updateDoc(doc(db, `${type}_${selectedCourse}`, id), {
          title: updatedTitle,
          description: updatedDescription,
        });
        alert("Updated successfully");
        setEditVideo(null);
      }
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  // Group video modules by title
  const groupedVideos = videoModules.reduce((acc, module) => {
    const key = module.title || "Untitled";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(module);
    return acc;
  }, {});

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar - Always visible on desktop and mobile */}
      <div className="w-full md:w-1/6 bg-white shadow-md">
        <Admin />
      </div>

      <div className="w-full md:w-3/4 px-4 sm:px-6 md:py-8 pt-16 mx-auto">
        <div className="mb-4">
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
          <textarea
            placeholder="Video Description"
            value={newVideoDescription}
            onChange={(e) => setNewVideoDescription(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="file"
            onChange={(e) => setNewVideoFile(e.target.files[0])}
            className="mb-2"
          />

          {/* Upload Progress Bar */}
          {videoUploadProgress > 0 && (
            <div className="mb-2">
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full"
                  style={{ width: `${videoUploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {uploading ? `Uploading... ${Math.round(videoUploadProgress)}%` : "Upload complete!"}
              </p>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex space-x-2">
            <button
              onClick={() =>
                handleUpload(newVideoTitle, newVideoDescription, newVideoFile, "videos")
              }
              disabled={uploading}
              className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${
                uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </button>

            {/* Cancel Upload Button */}
            {uploading && (
              <button
                onClick={cancelUpload}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Cancel 
              </button>
            )}
          </div>
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
              <p className="text-sm text-gray-600 mt-1">
                {Math.round(materialUploadProgress)}% uploaded
              </p>
            </div>
          )}
          <button
            onClick={() => handleUpload(newMaterialTitle, "", newMaterialFile, "materials")}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Upload Material
          </button>
        </div>

        {/* Video Sessions Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Video Sessions</h2>
          {Object.entries(groupedVideos).map(([title, modules]) => (
            <div key={title} className="mb-6">
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              {modules.map((module) => (
                <div key={module.id} className="p-4 border rounded mb-4 ml-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h4 className="font-bold">
                        {module.description?.substring(0, 40)}...
                      </h4>
                      <a
                        href={module.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </a>
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
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                      <label className="block font-medium">Edit Video Title</label>
                      <input
                        type="text"
                        defaultValue={module.title}
                        onChange={(e) => (module.title = e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                      />

                      <label className="block font-medium">Edit Video Description</label>
                      <textarea
                        defaultValue={module.description}
                        onChange={(e) => (module.description = e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                      />

                      <label className="block font-medium">Upload New Video (Optional)</label>
                      <input
                        type="file"
                        onChange={(e) => (module.newFile = e.target.files[0])}
                        className="mb-2"
                      />

                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleEdit(
                              module.id,
                              module.title,
                              module.description,
                              module.newFile,
                              "videos"
                            )
                          }
                          className="bg-green-500 text-white px-4 py-2 rounded w-full"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditVideo(null)}
                          className="bg-red-500 text-white px-4 py-2 rounded w-full"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Study Materials Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Study Materials</h2>
          {studyMaterials.map((material) => (
            <div key={material.id} className="p-4 border rounded mb-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="font-bold">{material.title}</h3>
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View
                  </a>
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
