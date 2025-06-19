// QandAAdminPanel.js
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Admin from "./Admin"

const QandAAdminPanel = () => {
  // --- Course Selection State ---
  const [courses, setCourses] = useState([]); // combined free and paid courses
  const [selectedCourse, setSelectedCourse] = useState(""); // course name selected by admin

  // --- Q&A Items State ---
  const [qandaItems, setQandaItems] = useState([]);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null); // video file to upload
  const [existingVideoUrl, setExistingVideoUrl] = useState(""); // when editing and no new file is chosen
  const [editingId, setEditingId] = useState(null);
  const [videoUploadMessage, setVideoUploadMessage] = useState("");

  // --- Comments State ---
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentStatusMessage, setCommentStatusMessage] = useState("");

  const storage = getStorage();

  // ---------------------------
  // Fetch Courses from Firestore
  // ---------------------------
  const fetchCourses = async () => {
    try {
      // Get free courses
      const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
      const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        courseName: doc.id,
        type: "free",
      }));

      // Get paid courses
      const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));
      const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        courseName: doc.id,
        type: "paid",
      }));

      setCourses([...freeCourses, ...paidCourses]);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ---------------------------
  // Fetch Q&A Items for Selected Course
  // ---------------------------
  const fetchQandAItems = async () => {
    if (!selectedCourse) return;
    try {
      const qandaRef = collection(db, "questionAndAnswer");
      const q = query(qandaRef, where("courseName", "==", selectedCourse));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQandaItems(items);
    } catch (error) {
      console.error("Error fetching Q&A items:", error);
    }
  };

  // ---------------------------
  // Fetch Comments for Selected Course
  // ---------------------------
  const fetchComments = async () => {
    if (!selectedCourse) return;
    try {
      const commentsRef = collection(db, "Comments_Vahaly_Astro");
      const q = query(commentsRef, where("courseName", "==", selectedCourse));
      const snapshot = await getDocs(q);
      const fetchedComments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Refetch Q&A items and comments when the selected course changes.
  useEffect(() => {
    if (selectedCourse) {
      fetchQandAItems();
      fetchComments();
    } else {
      setQandaItems([]);
      setComments([]);
    }
  }, [selectedCourse]);

  // ---------------------------
  // Handle Q&A Item Submission (Create/Update)
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      alert("Please fill out the Title.");
      return;
    }
    if (!selectedCourse) {
      alert("Please select a course first.");
      return;
    }
    try {
      let videoUrl = "";
      // If a new video file is chosen, upload it
      if (videoFile) {
        setVideoUploadMessage("Uploading video...");
        const storageRef = ref(
          storage,
          `qandaVideos/${Date.now()}_${videoFile.name}`
        );
        const snapshot = await uploadBytes(storageRef, videoFile);
        videoUrl = await getDownloadURL(snapshot.ref);
        setVideoUploadMessage("Video uploaded successfully!");
      } else if (editingId) {
        // If editing and no new file is chosen, use the existing video URL
        videoUrl = existingVideoUrl;
      }

      // Prepare Q&A item data with courseName field
      const qandaData = { title, subTitle, videoUrl, courseName: selectedCourse };

      if (editingId) {
        // Update existing Q&A item
        const itemRef = doc(db, "questionAndAnswer", editingId);
        await updateDoc(itemRef, qandaData);
        setEditingId(null);
        setExistingVideoUrl("");
      } else {
        // Create a new Q&A item
        await addDoc(collection(db, "questionAndAnswer"), qandaData);
      }
      // Clear form fields and refresh list
      setTitle("");
      setSubTitle("");
      setVideoFile(null);
      setTimeout(() => setVideoUploadMessage(""), 3000);
      fetchQandAItems();
    } catch (error) {
      console.error("Error saving Q&A item:", error);
      alert("Error saving the item. Please try again.");
    }
  };

  // Set the form for editing an existing Q&A item
  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSubTitle(item.subTitle || "");
    setExistingVideoUrl(item.videoUrl || "");
    setVideoFile(null);
  };

  // Delete a Q&A item
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "questionAndAnswer", id));
      fetchQandAItems();
    } catch (error) {
      console.error("Error deleting Q&A item:", error);
      alert("Error deleting the item. Please try again.");
    }
  };

  // ---------------------------
  // Handle Comment Submission (Create/Update)
  // ---------------------------
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName || !commentText) {
      alert("Please fill out both Name and Comment.");
      return;
    }
    if (!selectedCourse) {
      alert("Please select a course first.");
      return;
    }
    try {
      setCommentStatusMessage("Saving comment...");
      const commentData = { name: commentName, comment: commentText, courseName: selectedCourse };
      if (editingCommentId) {
        const commentRef = doc(db, "Comments_Vahaly_Astro", editingCommentId);
        await updateDoc(commentRef, commentData);
        setEditingCommentId(null);
      } else {
        await addDoc(collection(db, "Comments_Vahaly_Astro"), commentData);
      }
      setCommentName("");
      setCommentText("");
      setCommentStatusMessage("Comment saved successfully!");
      setTimeout(() => setCommentStatusMessage(""), 3000);
      fetchComments();
    } catch (error) {
      console.error("Error saving comment:", error);
      alert("Error saving the comment. Please try again.");
    }
  };

  // Set the form for editing an existing comment
  const handleEditComment = (comm) => {
    setEditingCommentId(comm.id);
    setCommentName(comm.userName);
    setCommentText(comm.comment);
  };

  // Delete a comment
  const handleDeleteComment = async (id) => {
    try {
      await deleteDoc(doc(db, "Comments_Vahaly_Astro", id));
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Error deleting the comment. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar - Visible always */}
      <div className=" bg-white shadow-md">
        <Admin />
      </div>
     
      <div className="w-full md:w-3/4 px-4 sm:px-6 py-16 md:py-8 mx-auto">
     <h2 className="text-3xl font-bold text-red-600 mb-8 text-center">
        Q&A Admin Panel
      </h2>

      {/* Course Selection Dropdown */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-red-600 mb-2">
          Select Course:
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full p-2 border border-red-600 rounded focus:outline-none"
        >
          <option value="">-- Select a Course --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.courseName}>
              {course.courseName} ({course.type})
            </option>
          ))}
        </select>
      </div>

      {/* Q&A Items Section */}
      <div className="mb-12 bg-white shadow rounded p-6">
        <h3 className="text-2xl font-bold text-red-600 mb-4">
          Manage Q&A Items
        </h3>
        {selectedCourse ? (
          <>
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
              <div>
                <label className="block text-red-600 font-semibold mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-red-600 rounded focus:outline-none"
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label className="block text-red-600 font-semibold mb-1">
                  Sub Title
                </label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full p-2 border border-red-600 rounded focus:outline-none"
                  placeholder="Enter sub title"
                />
              </div>
              <div>
                <label className="block text-red-600 font-semibold mb-1">
                  {editingId
                    ? "Replace Video File (Optional)"
                    : "Upload Video File"}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="w-full p-2 border border-red-600 rounded focus:outline-none"
                />
                {editingId && existingVideoUrl && (
                  <p className="text-sm text-gray-600 mt-1">
                    Current video is available. Upload a new file to replace it.
                  </p>
                )}
                {videoUploadMessage && (
                  <p className="text-sm text-green-600 mt-1">
                    {videoUploadMessage}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
              >
                {editingId ? "Update Q&A Item" : "Add Q&A Item"}
              </button>
            </form>

            <h4 className="text-xl font-semibold text-red-600 mb-3">
              Existing Q&A Items
            </h4>
            {qandaItems.length > 0 ? (
              <ul className="space-y-4">
                {qandaItems.map((item) => (
                  <li
                    key={item.id}
                    className="p-4 border border-red-600 rounded flex flex-col md:flex-row justify-between items-start md:items-center bg-white"
                  >
                    <div className="mb-2 md:mb-0">
                      <p className="font-bold text-red-600">{item.title}</p>
                      {item.subTitle && (
                        <p className="text-gray-700 italic">{item.subTitle}</p>
                      )}
                      {item.videoUrl && (
                        <video
                          src={item.videoUrl}
                          controls
                          className="w-full max-w-xs mt-2 rounded"
                        />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No Q&A items found for this course.</p>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600">
            Please select a course to manage its Q&A items.
          </p>
        )}
      </div>

      {/* Comments Section */}
      <div className="mb-12 bg-white shadow rounded p-6">
        <h3 className="text-2xl font-bold text-red-600 mb-4">Manage Comments</h3>
        {selectedCourse ? (
          <>
            <form onSubmit={handleCommentSubmit} className="mb-6 space-y-4">
              <div>
                <label className="block text-red-600 font-semibold mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full p-2 border border-red-600 rounded focus:outline-none"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-red-600 font-semibold mb-1">
                  Comment
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-2 border border-red-600 rounded focus:outline-none"
                  placeholder="Enter comment"
                  rows="3"
                ></textarea>
              </div>
              {commentStatusMessage && (
                <p className="text-sm text-green-600">{commentStatusMessage}</p>
              )}
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
              >
                {editingCommentId ? "Update Comment" : "Add Comment"}
              </button>
            </form>

            <h4 className="text-xl font-semibold text-red-600 mb-3">
              Existing Comments
            </h4>
            {comments.length > 0 ? (
              <ul className="space-y-4">
                {comments.map((comm) => (
                  <li
                    key={comm.id}
                    className="p-4 border border-red-600 rounded flex flex-col md:flex-row justify-between items-start md:items-center bg-white"
                  >
                    <div className="mb-2 md:mb-0">
                      <p className="font-bold text-red-600">{comm.userName}</p>
                      <p className="text-gray-800">{comm.comment}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditComment(comm)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comm.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments found for this course.</p>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600">
            Please select a course to manage its comments.
          </p>
        )}
      </div>
     </div>
    </div>
  );
};

export default QandAAdminPanel;
