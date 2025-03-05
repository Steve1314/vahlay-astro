import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { RiShareForwardFill } from "react-icons/ri"; // Share icon
 
const ArticlePage = () => {
  const { id } = useParams();
  const [language, setLanguage] = useState("hindi");
  const [article, setArticle] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
 
  // Close sidebar when clicking outside
  const handleClickOutside = () => {
    setIsOpen(false);
  };
  const toggleLanguage = () => {
    setLanguage(language === "hindi" ? "english" : "hindi");
  };
 
  const toggleDropdown = (id) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };
 
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, "Articles", id);
        const docSnap = await getDoc(docRef);
 
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      }
    };
 
    fetchArticle();
  }, [id]);
 
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const articlesQuery = query(collection(db, "Articles"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(articlesQuery);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFaqs(data);
      } catch (error) {
        console.error("Error fetching FAQs: ", error);
      }
    };
 
    fetchFAQs();
  }, []);
 
  const toggleAccordion = (index) => {
    setExpanded(expanded === index ? null : index);
  };
 
  const shareArticle = () => {
    if (!article) {
      console.error("Article data is not available");
      return;
    }
 
    console.log("Sharing article:", article.title); // Debugging
 
    if (navigator.share) {
      navigator
        .share({
          title: article.title || "Astrology Article",  // Ensuring a fallback
          text: `Check out this interesting astrology article: ${article.title || ""}`,
          url: window.location.href,
        })
        .then(() => console.log("Article shared successfully!"))
        .catch((error) => console.error("Error sharing article:", error));
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };
 
 
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-red-600 text-white py-12 px-4 md:px-20 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">
          Astrology Articles & Publications
        </h1>
        {article && (
          <p className="mt-2 text-lg">Articles on Astrology By <strong>Valay Patel</strong></p>
        )}
      </div>
 
      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
        {/* Article Section */}
        <div className="lg:w-3/4 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={toggleLanguage}
              className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
            >
              {language === "hindi" ? " Read in English" : "हिंदी में पढ़ें"}
            </button>
            <button
              onClick={shareArticle}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-red-600 px-4 py-2 rounded-lg transition"
            >
              <RiShareForwardFill className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-4">
            {article ? (language === "hindi" ? article.hindi : article.title) : "Loading..."}
          </h1>
          {article?.imageUrl && (
            <img
              src={article.imageUrl}
              alt="Article"
              className="w-full h-64 md:h-auto object-cover mb-6 rounded-lg shadow-md border-2 border-red-600"
            />
          )}
 
         
          <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
            {article ? (language === "hindi" ? article.dhindi : article.denglish) : "Loading..."}
          </p>
        </div>
 
        {/* Articles Sidebar */}
       
      {/* Desktop View - Static Sidebar */}
      <aside className="hidden w-2/6 lg:block  bg-white p-6 rounded-xl shadow-lg border border-gray-200  ">
        <h3 className="text-xl text-red-600 font-bold mb-4 text-center">Other Articles</h3>
        <ul className="space-y-4">
          {faqs.map((article) => (
            <li key={article.id} className="flex flex-col">
              <div
                className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100 transition"
                onClick={() => toggleDropdown(article.id)}
              >
                <span className="text-red-600 font-medium">
                  🔹 {language === "hindi" ? article.hindi : article.title}
                </span>
              </div>
 
              {expandedArticle === article.id && (
                <div className="bg-gray-50 border-l-4 border-red-600 mt-2 ml-4 p-3 rounded-lg shadow-inner">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {language === "hindi"
                      ? article.dhindi.split(" ").slice(0, 40).join(" ") + "..."
                      : article.denglish.split(" ").slice(0, 40).join(" ") + "..."}
                  </p>
                  <Link
                    to={`/article/${article.id}`}
                    className="text-red-500 font-medium hover:text-red-700 mt-2 inline-block transition"
                  >
                    ➡ Read More
                  </Link>
                </div>
              )}
            </li>
          ))}
        </ul>
      </aside>
 
      {/* Mobile View - Sidebar Drawer */}
      <div className="lg:hidden">
        {/* Overlay when sidebar is open */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={handleClickOutside}
          ></div>
        )}
 
        {/* Sidebar (Slides in on mobile) */}
        <aside
          className={`fixed top-0 left-0 h-full bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 z-50 ${
            isOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"
          }`}
          onClick={(e) => e.stopPropagation()} // Prevents sidebar from closing when clicking inside
        >
          {/* Close Button */}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 left-full ml-2 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition"
            >
              &lt;
            </button>
          )}
 
          {/* Sidebar Content */}
          <div className="p-6">
            <h3 className="text-xl text-red-600 font-bold mb-4 text-center">Other Articles</h3>
            <ul className="space-y-4">
              {faqs.map((article) => (
                <li key={article.id} className="flex flex-col">
                  <div
                    className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100 transition"
                    onClick={() => toggleDropdown(article.id)}
                  >
                    <span className="text-red-600 font-medium">
                      🔹 {language === "hindi" ? article.hindi : article.title}
                    </span>
                  </div>
 
                  {expandedArticle === article.id && (
                    <div className="bg-gray-50 border-l-4 border-red-600 mt-2 ml-4 p-3 rounded-lg shadow-inner">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {language === "hindi"
                          ? article.dhindi.split(" ").slice(0, 40).join(" ") + "..."
                          : article.denglish.split(" ").slice(0, 40).join(" ") + "..."}
                      </p>
                      <Link
                        to={`/article/${article.id}`}
                        className="text-red-500 font-medium hover:text-red-700 mt-2 inline-block transition"
                      >
                        ➡ Read More
                      </Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
 
        {/* Open Button (Hidden When Sidebar is Open) */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed top-80 left-2 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition z-50"
          >
            &gt;
          </button>
        )}
      </div>
   
      </div>
 
      {/* Related Articles Section */}
      <div className="container mx-auto py-8 px-4 md:px-20">
        <h1 className="text-3xl text-red-600 font-bold text-center mb-6">Related Articles</h1>
        <div className="grid grid-cols-1   gap-6">
          {faqs.slice(0, 6).map((faq, index) => (
            <div key={faq.id} className="bg-white border rounded-xl shadow-lg p-6">
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left text-lg font-semibold text-red-600 flex justify-between items-center"
              >
                {language === "hindi" ? faq.hindi : faq.title}
                <span>{expanded === index ? "▲" : "▼"}</span>
              </button>
              {expanded === index && (
                <div className="mt-2 text-gray-700">
                  <p>{language === "hindi" ? faq.dhindi : faq.denglish}</p>
                  <Link to="/courses">
                    <button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition">
                      Click Here for Courses
                    </button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
 
export default ArticlePage;