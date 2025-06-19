import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, writeBatch, query } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AdminSidebar from "./Admin";

const AdminTitleOrder = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch courses from both collections
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const freeSnapshot = await getDocs(collection(db, "freeCourses"));
        const paidSnapshot = await getDocs(collection(db, "paidCourses"));
        
        const allCourses = [
          ...paidSnapshot.docs.map(d => d.id),
          ...freeSnapshot.docs.map(d => d.id)
        ].filter((v, i, a) => a.indexOf(v) === i);
        
        setCourses(allCourses.sort());
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch titles with current order
  const fetchTitles = async (courseName) => {
    setLoading(true);
    try {
      const videosRef = collection(db, `videos_${courseName}`);
      const snapshot = await getDocs(videosRef);
      
      const titleMap = new Map();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.title) {
          titleMap.set(data.title, {
            id: doc.id,
            title: data.title,
            order: data['title-order'] || 0,
            docRef: doc.ref
          });
        }
      });

      const sortedTitles = Array.from(titleMap.values())
        .sort((a, b) => a.order - b.order);
      
      setTitles(sortedTitles);
    } catch (error) {
      console.error("Error fetching titles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Drag & Drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(titles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const orderedTitles = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setTitles(orderedTitles);
  };

  // Save Updated Order to Firestore
  const saveOrder = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      titles.forEach(title => {
        batch.update(title.docRef, {
          'title-order': title.order
        });
      });

      await batch.commit();
      alert("Order saved successfully!");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Manage Title Order
            </h1>
            
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                fetchTitles(e.target.value);
              }}
              className="w-full p-2 border rounded-md mb-4"
            >
              <option value="">Select a Course</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            selectedCourse && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="titles">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                    >
                      {titles.map((title, index) => (
                        <Draggable
                          key={title.title}
                          draggableId={title.title}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 border-b flex items-center justify-between hover:bg-gray-50 group transition-colors"
                            >
                              <div className="flex items-center gap-4 w-full">
                                <div 
                                  className="cursor-move text-gray-400"
                                >
                                  <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 6h16M4 12h16M4 18h16"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-800">
                                    {title.title}
                                  </h3>
                                </div>
                                <div className="text-gray-500">
                                  Order: {title.order}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )
          )}

          {!loading && selectedCourse && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveOrder}
                disabled={saving || !selectedCourse}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Order"}
              </button>
            </div>
          )}

          {!loading && selectedCourse && titles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No titles found for this course
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTitleOrder;
