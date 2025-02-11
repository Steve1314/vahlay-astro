import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc, getDocs, setDoc, collection } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import AdminSidebar from "./Admin";

const AdminCourseOrder = () => {
  const [courses, setCourses] = useState([]);
  const [courseOrder, setCourseOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const freeSnapshot = await getDocs(collection(db, "freeCourses"));
        const paidSnapshot = await getDocs(collection(db, "paidCourses"));

        const allCourses = [
          ...paidSnapshot.docs.map(d => ({
            id: d.id,
            title: d.data().title || d.id,
            imageUrl: d.data().imageUrl || "",
            type: "paid",
          })),
          ...freeSnapshot.docs.map(d => ({
            id: d.id,
            title: d.data().title || d.id,
            imageUrl: d.data().imageUrl || "",
            type: "free",
          })),
        ];

        const orderSnapshot = await getDoc(doc(db, "courseOrder", "displayOrder"));

        if (orderSnapshot.exists()) {
          const orderedIds = orderSnapshot.data().order;
          const orderedCourses = orderedIds
            .map(id => allCourses.find(c => c.id === id))
            .filter(c => c);

          setCourseOrder(orderedCourses.length ? orderedCourses : allCourses);
        } else {
          setCourseOrder(allCourses);
        }

        setCourses(allCourses);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updatedOrder = Array.from(courseOrder);
    const [reorderedItem] = updatedOrder.splice(result.source.index, 1);
    updatedOrder.splice(result.destination.index, 0, reorderedItem);

    setCourseOrder(updatedOrder);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "courseOrder", "displayOrder"), {
        order: courseOrder.map(c => c.id),
      });
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
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Manage Course Display Order
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Drag and drop courses to arrange display order
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="courses">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 md:p-4"
                    >
                      {courseOrder.map((course, index) => (
                        <Draggable key={course.id} draggableId={course.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-3 md:p-4 border-b flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 group transition-colors"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-6 md:w-8 text-gray-400">{index + 1}.</div>
                                <img
                                  src={course.imageUrl}
                                  alt={course.title}
                                  className="w-12 h-12 rounded-md object-cover"
                                />
                                <div className="flex-1">
                                  <h3 className="font-medium text-gray-800 text-sm md:text-base">
                                    {course.title}
                                  </h3>
                                  <p className="text-xs md:text-sm text-gray-500">
                                    {course.type === "paid" ? "Paid" : "Free"} Course
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
                                <span className="text-gray-400 text-xs md:text-sm">
                                  Drag to reorder
                                </span>
                                <svg
                                  className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
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
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="mt-6 flex flex-col items-center">
                <button
                  onClick={saveOrder}
                  disabled={saving}
                  className="w-full md:w-64 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Display Order"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCourseOrder;
