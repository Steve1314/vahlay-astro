import { article, title } from "framer-motion/client";
import React from "react";
import { Link } from "react-router-dom";
import { collection, getDocs,query, orderBy } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useState, useEffect } from "react"


const ArticlesPage = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Query the "Articles" collection and order by "createdAt" in descending order
      const articlesQuery = query(collection(db, "Articles"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(articlesQuery);

      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);




  return (
    <div className="bg-gray-50 min-h-screen" style={{ backgroundImage: "url('/assets/articalsbg.jpg')" }}>
      {/* Header */}
      <div className="bg-cover bg-center h-48 flex items-center justify-center shadow-md"
      >
        <h1 className="text-4xl font-bold text-black">Articles & Publications</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 md:px-8 lg:flex lg:space-x-6">
        {/* Articles Section */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
            {data.map((article, index) => (
            <Link to={`/article/${article.id}`} key={index}>
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between h-[610px]"> 
              {/* Image with fixed height */}
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt="Article"
                  className="w-full h-90 mb-4 rounded-md shadow-md object-cover" // Fixed height
                />
              )}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {article.hindi}
                </p>
              </div>
              <div className="mt-auto">
                <Link to={`/article/${article.id}`} className="text-red-600 text-sm font-semibold hover:underline">
                  Continue Reading &gt;
                </Link>
                <div className="mt-4 text-gray-500 text-sm">
                  {article.author} &bull; {article.date}
                </div>
              </div>
            </div>
          </Link>
          
            ))}
            
          </div>
          
        
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4 mt-8 lg:mt-0">
          <div className="bg-white shadow-md rounded-lg p-6">
            <Link to="/courses">
              <button className="w-full bg-red-500 text-white py-2 rounded-lg mb-4">
                Courses
              </button>
            </Link>
            <button className="w-full bg-red-500 text-white py-2 rounded-lg">
              Books
            </button>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Articles</h3>
            <ul className=" list-disc space-y-2 text-sm mx-2">
              {data.map((article, index) => (
                <li key={index} >
                  <Link to={`/article/${article.id}`} className=" text-red-600 mb-5">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;