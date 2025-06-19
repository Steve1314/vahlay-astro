import { article, title } from "framer-motion/client";
import React from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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
    <div className="bg-gray-50 min-h-screen text-sm" style={{ backgroundImage: "url('/assets/articalsbg.jpg')" }}>
      {/* Header */}
      <div className="bg-cover bg-center h-48 flex items-center justify-center shadow-md"
      >
        <h1 className="text-xl md:text-4xl font-bold text-black">Articles & Publications</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 md:px-8 lg:flex lg:space-x-6">
        {/* Articles Section */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {data.map((article, index) => (
              <Link to={`/article/${article.id}`} key={index}>
                <div className="md:w-64 w-72 md:left-0 left-7 bg-white shadow-md rounded-lg overflow-hidden relative">
                  {/* Top Image Section */}
                  <div className="relative">
                    {/* Main Article Image */}
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt="Article"
                        className="w-full h-40 object-cover"
                      />
                    )}

                    {/* Circular Logo (overlapping) */}
                    <div className="absolute -bottom-6 left-2 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center">
                      <img
                        src="/assets/vahlay_astro.png" // Replace with your actual logo path
                        alt="logo"
                        className="w-10 h-10 object-contain rounded-full"
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex flex-col h-full">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 my-3">
                      {article.title?.substring(0, 40)}...
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {article.hindi?.substring(0, 80)}...
                    </p>

                    {/* Footer / Read More */}
                    <div className="mt-auto pt-4">
                      <Link
                        to={`/article/${article.id}`}
                        className="text-red-600 text-sm font-semibold hover:underline"
                      >
                        Read More &gt;
                      </Link>

                      {/* Date / Author / Comments */}
                      <div className="mt-2 text-gray-500 text-xs">
                        {article.author && <span>by {article.author} | </span>}
                        {article.data} 
                      </div>
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