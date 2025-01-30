

// AdminArticles.js (Updated with Missing Fields and Fully Functional)
import React, { useState, useEffect } from "react";
import { db, storage } from "../../firebaseConfig";
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

  useEffect(() => {
    fetchArticles();
  }, []);

  //   const fetchArticles = async () => {
  //     try {
  //       const data = await getDocs(collection(db, "Articles"));
  //       const articlesData = data.docs.map((doc) => ({
  //         ...doc.data(),
  //         id: doc.id,
  //       }));
  //       setArticles(articlesData);
  //     } catch (error) {
  //       console.error("Error fetching articles:", error);
  //     }
  //   };

  const fetchArticles = async () => {
    try {
      const data = await getDocs(collection(db, "Articles"));
      const articlesData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setArticles(articlesData);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  // const handleSaveArticle = async () => {
  //   try {
  //     let imageUrl = formState.imageUrl;
  //     if (selectedImage) {
  //       const imageRef = ref(storage, `articles/${selectedImage.name}`);
  //       const uploadTask = await uploadBytes(imageRef, selectedImage);
  //       imageUrl = await getDownloadURL(uploadTask.ref);
  //     }

  //     const articleData = {
  //       ...formState,
  //       imageUrl,
  //     };

  //     if (editMode) {
  //       await updateDoc(doc(db, "Articles", formState.id), articleData);
  //     } else {
  //       await addDoc(collection(db, "Articles"), articleData);
  //     }
  //     fetchArticles();
  //     resetForm();
  //   } catch (error) {
  //     console.error("Error saving article:", error);
  //   }
  // };


  const handleSaveArticle = async () => {
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
        createdAt: serverTimestamp(), // Add timestamp here
      };
  
      if (editMode) {
        // Ensure createdAt remains unchanged on update
        const { createdAt, ...updatedArticleData } = articleData;
        await updateDoc(doc(db, "Articles", formState.id), updatedArticleData);
      } else {
        await addDoc(collection(db, "Articles"), articleData);
      }
  
      fetchArticles();
      resetForm();
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };
  



  const handleDeleteArticle = async (id) => {
    try {
      await deleteDoc(doc(db, "Articles", id));
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
    }
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
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


      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden bg-red-500 text-white p-2 rounded flex items-center"
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

        <section>
          <h2 className="text-3xl text-red-600 font-semibold mb-4">Manage Articles</h2>

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
              <button
                onClick={handleSaveArticle}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
              >
                {editMode ? "Update Article" : "Add Article"}
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
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="w-full md:w-auto px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                  >
                    Delete
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
