import React, { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import Admin from "./Admin";

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
          ...paidSnapshot.docs.map(d => ({
            id: d.id,
            title: d.data().title || d.id,
            type: "paid",
          })),
          ...freeSnapshot.docs.map(d => ({
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
        Object.keys(groupedVideos).forEach(title => {
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

    // Create copy of videos
    const updatedVideos = { ...videos };
    
    // Remove from source
    updatedVideos[sourceTitle] = updatedVideos[sourceTitle].filter((_, i) => i !== source.index);
    
    // Add to destination
    updatedVideos[destTitle] = [
      ...(updatedVideos[destTitle] || []).slice(0, destination.index),
      { ...movedVideo, title: destTitle },
      ...(updatedVideos[destTitle] || []).slice(destination.index)
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
          order: index,
          ...(sourceTitle !== video.title && { title: video.title }) 
        }
      });
    });

    // Update orders for destination title
    updatedVideos[destTitle].forEach((video, index) => {
      changes.push({
        id: video.id,
        updates: {
          order: index,
          title: destTitle
        }
      });
    });

    setPendingChanges(prev => [
      ...prev.filter(c => !changes.some(newC => newC.id === c.id)),
      ...changes
    ]);
  };

  // New save functionality
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

  // Updated delete handler (optional - keep immediate or add to pending)
  const handleDeleteVideo = async (videoId, title) => {
    try {
      // For immediate delete:
      await deleteDoc(doc(db, `videos_${selectedCourse}`, videoId));
      
      // For batched delete (add to pending changes):
      // setPendingChanges(prev => [...prev, { id: videoId, delete: true }]);
      
      setVideos(prev => ({
        ...prev,
        [title]: prev[title].filter(v => v.id !== videoId)
      }));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className=" bg-white shadow-md">
        <Admin />
      </div>


      <h1 className="text-2xl font-bold text-center mb-6">Course Video Management</h1>
      
      <div className="mb-8 flex justify-center">

          {/* Add save button header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Management</h1>
        {pendingChanges.length > 0 && (
          <button
            onClick={handleSaveChanges}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md transition-all"
          >
            💾 Save Changes ({pendingChanges.length})
          </button>
        )}
      </div>
        <select
          className="p-2 border rounded w-64"
          onChange={(e) => setSelectedCourse(e.target.value)}
          value={selectedCourse}
        >
          <option value="">Select a Course</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-6">
            {Object.keys(videos).map(title => (
              <div key={title} className="bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">{title}</h3>
                <Droppable droppableId={title}>
                  {(provided) => (
                    <ul
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {videos[title].map((video, index) => (
                        <Draggable
                          key={video.id}
                          draggableId={video.id}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border hover:shadow-md transition-shadow"
                            >
                              <div>
                                <span className="font-medium">{video.description}</span>
                                <span className="text-gray-500 ml-2 text-sm">
                                  (Order: {video.order})
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteVideo(video.id, title)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
  );
};

export default AdminVideoManager;