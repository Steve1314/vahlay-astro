import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebaseConfig"; // Firebase configuration file
import ActiveLink from "./ActiveLink"; // Custom Link component
import { PieChart, Pie, Cell } from "recharts";
import Aside from "./Aside";

const EnrollCourse = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    profilePic: "",
    fullName: "NA",
    email: "NA",
  });
  const [videoModules, setVideoModules] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoFile, setNewVideoFile] = useState(null);
  const [newVideoDescription, setNewVideoDescription] = useState("");
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialFile, setNewMaterialFile] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [materialUploadProgress, setMaterialUploadProgress] = useState(0);
  const [editVideo, setEditVideo] = useState(null);
  const [editMaterial, setEditMaterial] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadTask, setUploadTask] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");

  const navigate = useNavigate();
  const auth = getAuth();

  // Fetch courses from both freeCourses and paidCourses collections
  const fetchCourses = async (email) => {
    try {
      const docRef = doc(db, "subscriptions", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const freeCourses =
          data.freecourses?.map((courseName) => ({
            name: courseName,
            type: "Free",
            enrolled: true,
          })) || [];

        const paidCourses =
          data.DETAILS?.map((courseObj) => {
            const courseName = Object.keys(courseObj)[0];
            const details = courseObj[courseName];

            let daysLeft = 0;
            let usedDays = 0;
            let totalDays = 0;

            if (details.subscriptionDate && details.expiryDate) {
              const subDate = new Date(details.subscriptionDate);
              const expDate = new Date(details.expiryDate);
              const now = new Date();

              const totalTime = expDate.getTime() - subDate.getTime();
              totalDays = Math.floor(totalTime / (1000 * 3600 * 24));

              const usedTime = now.getTime() - subDate.getTime();
              usedDays =
                usedTime > 0 ? Math.floor(usedTime / (1000 * 3600 * 24)) : 0;

              const rawDaysLeft = totalDays - usedDays;
              daysLeft = rawDaysLeft < 0 ? 0 : rawDaysLeft;
            }

            return {
              name: courseName,
              type: "Paid",
              enrolled: details.status === "active",
              expiryDate: details.expiryDate,
              subscriptionDate: details.subscriptionDate,
              daysLeft,
              usedDays,
              totalDays,
            };
          }) || [];

        setCourses([...freeCourses, ...paidCourses]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCourses(currentUser.email);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // Fetch profile data for the current user
  useEffect(() => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      const fetchProfile = async () => {
        const userDocRef = doc(db, "students", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            profilePic: userData.profilePic || "",
            fullName: userData.fullName || "NA",
            email: currentUser.email || "NA",
          });
        } else {
          setFormData({
            profilePic: "",
            fullName: "NA",
            email: currentUser.email || "NA",
          });
        }
        setLoading(false);
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [db]);

  // Handle file upload for videos and study materials
  const handleUpload = async (title, description, file, type) => {
    try {
      if (!file) {
        alert("Please select a file to upload.");
        return;
      }
      setUploading(true);
      const storageRef = ref(
        storage,
        `${type}/${selectedCourse}/${Date.now()}_${file.name}`
      );
      const uploadTaskInstance = uploadBytesResumable(storageRef, file);
      setUploadTask(uploadTaskInstance);

      uploadTaskInstance.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
          // Update state if uploading a video
          if (type === "videos") {
            setVideoModules([
              ...videoModules,
              { title, description, url: fileUrl },
            ]);
          }
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
      uploadTask.cancel();
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
        setStudyMaterials(
          studyMaterials.filter((material) => material.id !== id)
        );
      }
      alert("Deleted successfully");
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleEdit = async (
    id,
    updatedTitle,
    updatedDescription,
    file,
    type
  ) => {
    try {
      let fileUrl = null;
      if (file) {
        const storageRef = ref(
          storage,
          `${type}/${selectedCourse}/${Date.now()}_${file.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          () => {},
          (error) => {
            console.error("File upload failed:", error);
          },
          async () => {
            fileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            const updatedData = {
              title: updatedTitle,
              description: updatedDescription,
            };
            if (fileUrl) updatedData.url = fileUrl;
            await updateDoc(
              doc(db, `${type}_${selectedCourse}`, id),
              updatedData
            );
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

  // Group video modules by title for structured display
  const groupedVideos = videoModules.reduce((acc, module) => {
    const key = module.title || "Untitled";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(module);
    return acc;
  }, {});

  // Mini pie chart for paid course validity
  const MiniPieChart = ({ usedDays, daysLeft }) => {
    const data = [
      { name: "Days Used", value: usedDays },
      { name: "Days Left", value: daysLeft },
    ];
    const COLORS = ["#FF6347", "#FFDAB9"];

    if (usedDays === 0 && daysLeft === 0) {
      return <span className="text-red-400 font-medium">N/A</span>;
    }
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
        </div>
      );
    }
    return (
      <div className="w-20 h-20 flex items-center justify-center">
        <PieChart width={80} height={80}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={35}
            labelLine={false}
            label={({ value }) => `${value}d`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center ">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <Aside />
      {/* Main Content */}
      <main className="flex-1 bg-white shadow-lg rounded-lg p-6 pt-16 my-4 md:m-0 md:pt-6 overflow-x-auto">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Your Courses
        </h2>

        {/* Show message if no courses are enrolled */}
        {courses.length === 0 ? (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">
              You are not enrolled in any courses yet.
            </h3>
            <p className="text-gray-600 mt-2">
              Explore our courses and start your learning journey today.
            </p>
            <Link to="/courses">
              <button className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Browse Courses
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile: Grid View */}
            <div className="grid gap-4 md:hidden">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg bg-red-50 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-700">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-600">Type: {course.type}</p>
                  <p className="text-sm text-gray-600">
                    Enrolled: {course.enrolled ? "Yes" : "No"}
                  </p>
                  {course.type === "Paid" && (
                    <div className="mt-2 flex items-center space-x-2">
                      <MiniPieChart
                        usedDays={course.usedDays}
                        daysLeft={course.daysLeft}
                      />
                      <span className="text-sm text-gray-600">
                        Left: {course.daysLeft}d
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() =>
                      navigate(`/course/${encodeURIComponent(course.name)}`)
                    }
                    className="mt-4 bg-red-500 hover:bg-red-400 text-white py-1 px-3 rounded"
                  >
                    Start Learning
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block">
              <table className="w-full bg-white rounded">
                <thead>
                  <tr className="bg-red-100 text-left">
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Course Name
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Type
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Enrolled
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Validity
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-red-50 bg-white transition-shadow"
                    >
                      <td className="py-3 px-4 text-gray-700">{course.name}</td>
                      <td className="py-3 px-4 text-gray-700">{course.type}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {course.enrolled ? "Yes" : "No"}
                      </td>
                      <td className="py-3 px-4">
                        {course.type === "Paid" ? (
                          <div className="flex items-center space-x-2">
                            <MiniPieChart
                              usedDays={course.usedDays}
                              daysLeft={course.daysLeft}
                            />
                            <span className="text-sm text-gray-600">
                              Left: {course.daysLeft}d
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/course/${encodeURIComponent(course.name)}`
                            )
                          }
                          className="bg-red-500 hover:bg-red-400 text-white py-1 px-3 rounded"
                        >
                          Start Learning
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

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
                      <label className="block font-medium">
                        Edit Video Title
                      </label>
                      <input
                        type="text"
                        defaultValue={module.title}
                        onChange={(e) => (module.title = e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                      />

                      <label className="block font-medium">
                        Edit Video Description
                      </label>
                      <textarea
                        defaultValue={module.description}
                        onChange={(e) => (module.description = e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                      />

                      <label className="block font-medium">
                        Upload New Video (Optional)
                      </label>
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
                    onClick={() =>
                      handleEdit(
                        material.id,
                        material.title,
                        material.newFile,
                        "materials"
                      )
                    }
                    className="bg-green-500 text-white px-4 py-2 rounded w-full"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EnrollCourse;
