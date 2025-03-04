import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { RiShareForwardFill } from "react-icons/ri"; // Import the icon
 
const ArticlePage = () => {
  const { id } = useParams(); // Get the article ID from the URL
  const [language, setLanguage] = useState("hindi");
  const [article, setArticle] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [expanded, setExpanded] = useState(null);
 
  const toggleLanguage = () => {
    setLanguage(language === "hindi" ? "english" : "hindi");
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
 
  // Function to share the article
  const shareArticle = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article ? article.title : "Astrology Article",
          text: "Check out this interesting astrology article!",
          url: window.location.href, // Current page URL
        })
        .then(() => console.log("Article shared successfully!"))
        .catch((error) => console.error("Error sharing article:", error));
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };
 
  return (
    <div className="bg-ivory min-h-screen">
      {/* Article Header */}
      <div className="bg-red-600 border-t-2 border-orange-100 py-12 px-4 md:px-20">
        <h1 className="text-2xl md:text-4xl font-bold text-center text-white tracking-wide">
          Astrology Articles and Publications
        </h1>
        <div className="flex justify-center mt-4 text-sm text-white space-x-4">
          {article ? (
            <>
              <span>Articles on Astrology By <strong>Valay Patel</strong></span>
            </>
          ) : (
            <span className="bg-red-300 h-4 w-24 rounded animate-pulse"></span>
          )}
        </div>
      </div>
 
      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 md:px-20 flex flex-col lg:flex-row lg:space-x-8">
        {/* Article Body */}
        <div className="lg:w-3/4 bg-white p-8 rounded-lg shadow-xl shadow-orange-100">
          <div className="flex justify-between items-center">
            <button
              onClick={toggleLanguage}
              className="bg-red-600 text-white px-6 py-2 rounded-lg mb-6 hover:bg-red-700 transition"
            >
              {language === "hindi" ? " Read in English" : "हिंदी में पढ़ें"}
            </button>
            {/* Share Button */}
            <button
              onClick={shareArticle}
              className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-red-600 px-4 py-2 rounded-lg transition"
            >
              <RiShareForwardFill className="w-5 h-5 text-red-600" /> {/* Red Share Icon */}
              <span>Share</span>
            </button>
          </div>
 
          <div className="flex items-center justify-center">
            {article?.imageUrl && (
              <img
                src={article.imageUrl}
                alt="Article"
                className="w-auto h-60 md:h-96 mb-6 rounded-lg shadow-md border-2 border-red-600"
              />
            )}
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-red-600 mb-4 tracking-wide">
            {article ? (language === "hindi" ? article.hindi : article.title) : "Loading..."}
          </h1>
          {article ? (
            <p className="text-gray-800 text-sm md:text-lg leading-relaxed whitespace-pre-line">
              {language === "hindi" ? article.dhindi : article.denglish}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="h-4 bg-red-300 rounded animate-pulse"></div>
            </div>
          )}
        </div>
 
        {/* Articles List */}
        <div className="bg-ivory border border-red-600 p-8 rounded-lg shadow-lg mt-4">
          <h3 className="text-xl text-red-600 font-bold mb-6 text-center">Articles</h3>
          <ul className="md:space-y-6">
            {faqs.map((article) => (
              <li key={article.id} className="flex items-center">
                <div className="w-2 h-2 bg-red-600 rounded-full mr-4"></div>
                <Link
                  to={`/article/${article.id}`}
                  className="text-red-600 text-sm md:text-base font-medium hover:underline transition duration-200"
                >
                  {language === "hindi" ? article.hindi : article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
 
      {/* Related Articles */}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl text-red-600 font-bold text-center mb-6 tracking-wide">Related Articles</h1>
        <div className="space-y-4">
          {faqs.length > 0 ? (
            faqs.slice(0, 7).map((faq, index) => (
              <div key={faq.id} className="border rounded-lg shadow-lg bg-red-600">
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left px-4 py-3 flex justify-between items-center"
                >
                  <span className="text-sm md:text-lg text-white font-medium tracking-wide">
                    {language === "hindi" ? faq.hindi : faq.title}
                  </span>
                  <span className="text-white">{expanded === index ? "▲" : "▼"}</span>
                </button>
                {expanded === index && (
                  <div className="p-4 bg-white text-red-600">
                    <p>{language === "hindi" ? faq.dhindi : faq.denglish}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default ArticlePage;