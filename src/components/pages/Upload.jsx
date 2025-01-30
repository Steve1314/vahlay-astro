import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebaseConfig";
import { Link } from "react-router-dom";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const AdminPortal = () => {
    const [courses, setCourses] = useState([]); // List of courses
    const [selectedCourse, setSelectedCourse] = useState(""); // Selected course
    const [videoTitle, setVideoTitle] = useState(""); // Video title
    const [selectedVideo, setSelectedVideo] = useState(null); // Selected video file
    const [videoUploadProgress, setVideoUploadProgress] = useState(0); // Video upload progress
    const [materialTitle, setMaterialTitle] = useState(""); // Study material title
    const [selectedMaterial, setSelectedMaterial] = useState(null); // Selected study material
    const [materialUploadProgress, setMaterialUploadProgress] = useState(0); // Material upload progress
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch courses from Firestore
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
                const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));

                const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    title: doc.data().title || `Untitled (ID: ${doc.id})`, // Handle missing title
                }));
                const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    title: doc.data().title || `Untitled (ID: ${doc.id})`, // Handle missing title
                }));

                setCourses([...freeCourses, ...paidCourses]); // Combine free and paid courses
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, []);

    // Handle video upload
    const handleVideoUpload = async () => {
        if (!selectedCourse || !videoTitle || !selectedVideo) {
            alert("Please select a course, enter a video title, and upload a video file.");
            return;
        }

        const storageRef = ref(
            storage,
            `videos/${selectedCourse}/${Date.now()}_${selectedVideo.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, selectedVideo);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setVideoUploadProgress(progress);
            },
            (error) => {
                console.error("Video upload failed:", error);
            },
            async () => {
                const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);

                // Update Firestore
                const videosRef = doc(db, `videos_${selectedCourse}`, `${Date.now()}`);
                await setDoc(videosRef, {
                    title: videoTitle,
                    url: videoUrl,
                });

                setVideoTitle("");
                setSelectedVideo(null);
                setVideoUploadProgress(0);
                alert("Video uploaded successfully!");
            }
        );
    };

    // Handle study material upload
    const handleMaterialUpload = async () => {
        if (!selectedCourse || !materialTitle || !selectedMaterial) {
            alert("Please select a course, enter a material title, and upload a material file.");
            return;
        }

        const storageRef = ref(
            storage,
            `studyMaterials/${selectedCourse}/${Date.now()}_${selectedMaterial.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, selectedMaterial);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setMaterialUploadProgress(progress);
            },
            (error) => {
                console.error("Material upload failed:", error);
            },
            async () => {
                const materialUrl = await getDownloadURL(uploadTask.snapshot.ref);

                // Update Firestore
                const materialsRef = doc(db, `materials_${selectedCourse}`, `${Date.now()}`);
                await setDoc(materialsRef, {
                    title: materialTitle,
                    url: materialUrl,
                });

                setMaterialTitle("");
                setSelectedMaterial(null);
                setMaterialUploadProgress(0);
                alert("Study material uploaded successfully!");
            }
        );
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white">
            {/* Sidebar/Aside Section */}
            {/* Sidebar/Aside Section */}
            <aside
                className={`w-full h-screen md:w-1/6 bg-red-600 text-white p-4 shadow-lg transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    } md:relative fixed top-0 left-0 z-10`}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold">Admin Portal</h1>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-2xl font-bold"
                    >
                        ✖
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="my-">
                    <ul className="space-y-4">
                        <li>
                            <Link
                                to="/admin#articles"
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-red-100"
                            >
                                Articles
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin#addcourses"
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-red-100"
                            >
                                Add Courses
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin#calendar"
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-red-100"
                            >
                                Calendar
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin#uploadmaterials"
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-red-100"
                            >
                                Upload Materials
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>


            {/* Main Content Section */}
            <div className="flex-1 p-8 bg-gray-50">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden bg-red-500 text-white p-2 rounded flex items-center"
                >
                    ☰
                </button>
                <h1 className="text-3xl font-bold text-red-600 mb-6">Admin Dashboard</h1>

                {/* Select Course */}
                <div className="mb-8">
                    <label className="block text-lg font-semibold text-red-600 mb-2">Select Course:</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full p-3 border rounded"
                    >
                        <option value="">-- Select a Course --</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Upload Video */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Upload Video Module</h2>
                    <input
                        type="text"
                        placeholder="Video Title"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full p-3 border rounded mb-4"
                    />
                    <input
                        type="file"
                        onChange={(e) => setSelectedVideo(e.target.files[0])}
                        className="mb-4"
                    />
                    <button
                        onClick={handleVideoUpload}
                        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-500"
                    >
                        Upload Video
                    </button>
                    {videoUploadProgress > 0 && (
                        <p className="text-sm text-gray-700 mt-2">
                            Uploading: {videoUploadProgress.toFixed(0)}%
                        </p>
                    )}
                </div>

                {/* Upload Study Material */}
                <div>
                    <h2 className="text-xl font-bold text-red-600 mb-4">Upload Study Material</h2>
                    <input
                        type="text"
                        placeholder="Material Title"
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                        className="w-full p-3 border rounded mb-4"
                    />
                    <input
                        type="file"
                        onChange={(e) => setSelectedMaterial(e.target.files[0])}
                        className="mb-4"
                    />
                    <button
                        onClick={handleMaterialUpload}
                        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-500"
                    >
                        Upload Material
                    </button>
                    {materialUploadProgress > 0 && (
                        <p className="text-sm text-gray-700 mt-2">
                            Uploading: {materialUploadProgress.toFixed(0)}%
                        </p>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AdminPortal;
