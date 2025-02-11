import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebaseConfig";
import Admin from "./Admin";  
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";

const AdminArticles = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // NEW: Buffering while fetching articles
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    author: "",
    data: "",
    denglish: "",
    dhindi: "",
    hindi: "",
    imageUrl: "",
    description: "",
    type: "",
    content: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [alertMessage, setAlertMessage] = useState(""); // NEW: Alert message
  const [alertType, setAlertType] = useState(""); // NEW: Success or error
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const data = await getDocs(collection(db, "Articles"));
      const articlesData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setArticles(articlesData);
    } catch (error) {
      showAlert("Error fetching articles. Please try again.", "error");
    }
    setIsLoading(false);
  };

  const handleSaveArticle = async () => {
    setIsSaving(true);
    try {
      let imageUrl = formState.imageUrl;
      if (selectedImage) {
        const imageRef = ref(storage, `articles/${selectedImage.name}`);
        const uploadTask = await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(uploadTask.ref);
      }

      const articleData = {
        ...formState,
        imageUrl,
        createdAt: serverTimestamp(),
      };

      if (editMode) {
        const { createdAt, ...updatedArticleData } = articleData;
        await updateDoc(doc(db, "Articles", formState.id), updatedArticleData);
        showAlert("Article updated successfully!", "success");
      } else {
        await addDoc(collection(db, "Articles"), articleData);
        showAlert("Article added successfully!", "success");
      }

      fetchArticles();
      resetForm();
    } catch (error) {
      showAlert("Error saving article. Please try again.", "error");
    }
    setIsSaving(false);
  };

  const handleDeleteArticle = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this article?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "Articles", id));
      showAlert("Article deleted successfully!", "success");
      fetchArticles();
    } catch (error) {
      showAlert("Error deleting article. Please try again.", "error");
    }
    setIsDeleting(false);
  };

  const resetForm = () => {
    setFormState({
      title: "",
      author: "",
      data: "",
      denglish: "",
      dhindi: "",
      hindi: "",
      imageUrl: "",
      description: "",
      type: "",
      content: "",
    });
    setSelectedImage(null);
    setEditMode(false);
    setFormVisible(false);
    setUploadProgress(0);
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 3000);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar - Always visible on desktop and mobile */}
      <div className="w-full md:w-1/4 bg-white shadow-md">
        <Admin />
      </div>

      <div className="w-full md:w-3/4 px-4 sm:px-6 py-8 mx-auto">
        {/* 🔔 Alert Messages for Success/Error */}
        {alertMessage && (
          <div className={`p-2 text-center text-white ${alertType === "success" ? "bg-green-500" : "bg-red-500"} rounded-md mb-4`}>
            {alertMessage}
          </div>
        )}

        <section>
          <h2 className="text-3xl text-red-600 font-semibold mb-4">Manage Articles</h2>
          {/* ⏳ Loader for Fetching Articles */}
          {isLoading && <p className="text-center text-gray-500">Loading articles...</p>}


          {formVisible && (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4 bg-gray-100 p-6 rounded-lg relative"
            >
              <button
                type="button"
                onClick={() => setFormVisible(false)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                ✖
              </button>
              <div>
                <label className="block font-medium">Title</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) =>
                    setFormState({ ...formState, title: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Hindi Title</label>
                <input
                  type="text"
                  value={formState.hindi}
                  onChange={(e) =>
                    setFormState({ ...formState, hindi: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Author</label>
                <input
                  type="text"
                  value={formState.author}
                  onChange={(e) =>
                    setFormState({ ...formState, author: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Date</label>
                <input type="date"
                  value={formState.data}
                  onChange={(e) =>
                    setFormState({ ...formState, data: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Denglish</label>
                <textarea
                  value={formState.denglish}
                  onChange={(e) =>
                    setFormState({ ...formState, denglish: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div>
                <label className="block font-medium">Dhindi</label>
                <textarea
                  value={formState.dhindi}
                  onChange={(e) =>
                    setFormState({ ...formState, dhindi: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div>
                <label className="block font-medium">Upload Image</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
                {uploadProgress > 0 && (
                  <p className="mt-2 text-sm text-blue-500">
                    Uploading: {Math.round(uploadProgress)}%
                  </p>
                )}
              </div>
              <button onClick={handleSaveArticle} disabled={isSaving} className={`px-4 py-2 w-full ${isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}>
              {isSaving ? "Saving..." : editMode ? "Update Article" : "Add Article"}
            </button>
            </form>
          )}

          <button
            onClick={() => {
              resetForm();
              setFormVisible(true);
            }}
            className="w-full md:w-auto px-6 py-3 bg-red-500 text-white rounded-full hover:bg-green-600 transition-all text-center mb-4"
          >
            Upload New Article
          </button>

          <ul className="space-y-4">
            {articles.map((article) => (
              <li
                key={article.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border rounded-lg bg-white shadow-md"
              >
                <span className="text-red-800">
                  <strong>{article.title}</strong> <br /> (Hindi: {article.hindi})
                </span>
                <div className="flex gap-4 w-full md:w-auto">
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setFormState(article);
                      setFormVisible(true);
                    }}
                    className="w-full md:w-auto px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteArticle(article.id)} disabled={isDeleting} className={`ml-4 px-4 py-2 ${isDeleting ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"} rounded-full`}>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminArticles;