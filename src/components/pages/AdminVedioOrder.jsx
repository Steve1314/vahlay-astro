import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useParams, Link } from "react-router-dom";
import Admin from "./Admin";

// Custom dropdown component for course selection
const CourseDropdown = ({ courses, selectedCourse, setSelectedCourse }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTitle =
    courses.find((course) => course.id === selectedCourse)?.title || "Select a Course";

  return (
    <div className="relative mb-8 flex justify-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 border border-gray-300 rounded-lg w-full max-w-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gradient-to-r from-red-700 to-red-900 text-white"
      >
        {selectedTitle}
      </button>
      {isOpen && (
        <ul className="absolute mt-1 w-full max-w-xs bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg shadow-lg z-10">
          {courses.map((course) => (
            <li
              key={course.id}
              onClick={() => {
                setSelectedCourse(course.id);
                setIsOpen(false);
              }}
              className="p-3 cursor-pointer hover:bg-red-800"
            >
              {course.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminVideoManager = () => {
  const { courseName } = useParams();
  const [videos, setVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const freeSnapshot = await getDocs(collection(db, "freeCourses"));
        const paidSnapshot = await getDocs(collection(db, "paidCourses"));

        const allCourses = [
          ...paidSnapshot.docs.map((d) => ({
            id: d.id,
            title: d.data().title || d.id,
            type: "paid",
          })),
          ...freeSnapshot.docs.map((d) => ({
            id: d.id,
            title: d.data().title || d.id,
            type: "free",
          })),
        ];

        setCourses(allCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const videosRef = collection(db, `videos_${selectedCourse}`);
        const snapshot = await getDocs(videosRef);
        const groupedVideos = {};

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const title = data.title || "Untitled";
          if (!groupedVideos[title]) {
            groupedVideos[title] = [];
          }
          groupedVideos[title].push({ id: doc.id, ...data });
        });

        // Sort videos within each title by order
        Object.keys(groupedVideos).forEach((title) => {
          groupedVideos[title].sort((a, b) => a.order - b.order);
        });

        setVideos(groupedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
      setLoading(false);
    };
    fetchVideos();
  }, [selectedCourse]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceTitle = source.droppableId;
    const destTitle = destination.droppableId;
    const movedVideo = videos[sourceTitle][source.index];

    // Create a copy of videos
    const updatedVideos = { ...videos };

    // Remove from source
    updatedVideos[sourceTitle] = updatedVideos[sourceTitle].filter((_, i) => i !== source.index);

    // Add to destination
    updatedVideos[destTitle] = [
      ...(updatedVideos[destTitle] || []).slice(0, destination.index),
      { ...movedVideo, title: destTitle },
      ...(updatedVideos[destTitle] || []).slice(destination.index),
    ];

    // Update local state
    setVideos(updatedVideos);

    // Track changes for saving later
    const changes = [];

    // Update orders for source title
    updatedVideos[sourceTitle].forEach((video, index) => {
      changes.push({
        id: video.id,
        updates: {
          order: index + 1,
          ...(sourceTitle !== video.title && { title: video.title }),
        },
      });
    });

    // Update orders for destination title
    updatedVideos[destTitle].forEach((video, index) => {
      changes.push({
        id: video.id,
        updates: {
          order: index + 1,
          title: destTitle,
        },
      });
    });

    setPendingChanges((prev) => [
      ...prev.filter((c) => !changes.some((newC) => newC.id === c.id)),
      ...changes,
    ]);
  };

  // Save changes to Firestore
  const handleSaveChanges = async () => {
    if (!pendingChanges.length) return;

    try {
      const batchUpdates = pendingChanges.map(({ id, updates }) =>
        updateDoc(doc(db, `videos_${selectedCourse}`, id), updates)
      );

      await Promise.all(batchUpdates);
      setPendingChanges([]);
      alert("All changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  // Delete video handler
  const handleDeleteVideo = async (videoId, title) => {
    try {
      await deleteDoc(doc(db, `videos_${selectedCourse}`, videoId));

      setVideos((prev) => ({
        ...prev,
        [title]: prev[title].filter((v) => v.id !== videoId),
      }));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="bg-white shadow-md  w-1/6 md:w-64">
        <Admin />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:p-6 py-16 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Course Video Management</h1>
          {pendingChanges.length > 0 && (
            <button
              onClick={handleSaveChanges}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              💾 Save Changes ({pendingChanges.length})
            </button>
          )}
        </div>

        {/* Course Selection using custom dropdown */}
        <CourseDropdown
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
        />

        {/* Video List */}
        {selectedCourse && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-6">
              {Object.keys(videos).map((title) => (
                <div
                  key={title}
                  className="bg-white p-5 rounded-lg shadow-md border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">{title}</h3>
                  <Droppable droppableId={title}>
                    {(provided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {videos[title].map((video, index) => (
                          <Draggable key={video.id} draggableId={video.id} index={index}>
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex justify-between items-center bg-gray-50 p-4 rounded-md shadow-sm border border-gray-300 hover:shadow-md transition-all"
                              >
                                <div>
                                  <span className="font-medium text-gray-800">
                                    {video.description}
                                  </span>
                                  <span className="text-gray-500 ml-2 text-sm">
                                    (Order: {video.order + 1})
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteVideo(video.id, title)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md transition-all"
                                >
                                  Delete
                                </button>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default AdminVideoManager;
