import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { RiShareForwardFill, RiFacebookFill, RiTwitterFill, RiLinkedinFill, RiWhatsappFill } from "react-icons/ri";
import { Helmet } from "react-helmet";

const ArticlePage = () => {
  const { id } = useParams();
  const [language, setLanguage] = useState("hindi");
  const [article, setArticle] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Language toggle
  const toggleLanguage = () => {
    setLanguage(prev => prev === "hindi" ? "english" : "hindi");
  };

  // Share functionality
  const handleShareClick = () => setShowShareOptions(!showShareOptions);
  const handleClickOutside = (e) => {
    if (!e.target.closest('.share-container')) setShowShareOptions(false);
  };

  // Social sharing functions
  const shareOnFacebook = () => window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    'facebook-share-dialog',
    'width=800,height=600'
  );

  const shareOnTwitter = () => window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(article?.title || '')}&url=${encodeURIComponent(window.location.href)}`,
    'twitter-share',
    'width=800,height=600'
  );

  const shareOnWhatsApp = () => window.open(
    `whatsapp://send?text=${encodeURIComponent(`${article?.title || ''} ${window.location.href}`)}`,
    '_blank'
  );

  const shareOnLinkedIn = () => window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    'linkedin-share',
    'width=800,height=600'
  );

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Data fetching
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, "Articles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setArticle({ id: docSnap.id, ...docSnap.data() });
      } catch (error) {
        console.error("Error fetching article:", error);
      }
    };
    fetchArticle();
  }, [id]);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, "Articles"), orderBy("createdAt", "desc")));
        setFaqs(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching FAQs: ", error);
      }
    };
    fetchFAQs();
  }, []);

  // SEO Meta Tags
  const getMetaTags = () => {
    if (!article) return null;
    const description = language === "hindi" ?
      (article.dhindi || "").substring(0, 160) :
      (article.denglish || "").substring(0, 160);

    return (
      <Helmet>
        <title>{article.title} - Astrology Articles by Valay Patel</title>
        <meta name="description" content={`${description}...`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={`${description}...`} />
        <meta property="og:image" content={article.imageUrl} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={article.title} />
        <meta property="twitter:description" content={`${description}...`} />
        <meta property="twitter:image" content={article.imageUrl} />
      </Helmet>
    );
  };

  // Toggle functions
  const toggleDropdown = (id) => setExpandedArticle(prev => prev === id ? null : id);
  const toggleAccordion = (index) => setExpanded(prev => prev === index ? null : index);

  return (
    <div className="bg-gray-50 min-h-screen text-sm">
      {getMetaTags()}

      {/* Header */}
      <div className="bg-red-600 text-white py-12 px-4 md:px-20 text-center">
        <h1 className="text-xl md:text-4xl font-extrabold tracking-wide">
          Astrology Articles & Publications
        </h1>
        {article && <p className="mt-2 text-base">Articles on Astrology By <strong>Valay Patel</strong></p>}
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
        {/* Article Content */}
        <div className="lg:w-3/4 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={toggleLanguage}
              className="bg-red-600 text-white px-5 py-1 text-xs  rounded-lg hover:bg-red-700 transition"
            >
              {language === "hindi" ? "English" : "हिंदी "}
            </button>

            <div className="relative share-container">
              <button
                onClick={handleShareClick}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-red-600 px-2 py-1 rounded-lg transition"
              >
                <RiShareForwardFill className="w-5 h-5" />

              </button>

              {showShareOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  {[
                    { icon: RiFacebookFill, color: "blue-600", action: shareOnFacebook, text: "Facebook" },
                    { icon: RiTwitterFill, color: "blue-400", action: shareOnTwitter, text: "Twitter" },
                    { icon: RiLinkedinFill, color: "blue-700", action: shareOnLinkedIn, text: "LinkedIn" },
                    { icon: RiWhatsappFill, color: "green-500", action: shareOnWhatsApp, text: "WhatsApp" },
                    { icon: RiShareForwardFill, color: "gray-600", action: copyToClipboard, text: "Copy Link" },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={item.action}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                    >
                      <item.icon className={`text-${item.color} mr-2`} />
                      {item.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {article && (
            <div>
              <h1 className=" md:text-4xl font-bold text-red-600 mb-4">
                {language === "hindi" ? article.hindi : article.title}
              </h1>

              {article.imageUrl && (
                <div className="relative mb-6">
                  <img
                    src={article.imageUrl}
                    alt="Article visual content"
                    className="w-full h-64 md:h-[500px] object-cover rounded-lg shadow-md border-2 border-red-600"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <p className="text-white text-sm italic">
                      {article.imageCaption || "Astrology illustration by Valay Patel"}
                    </p>
                  </div>
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-gray-800  leading-relaxed whitespace-pre-line">
                  {language === "hindi" ? article.dhindi : article.denglish}
                </p>
              </div>
              {/* Reference Video Link */}
              {article.referenceLink && (
                <div className="my-6">
                  <a
                    href={article.referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    ▶ Watch Reference Video
                  </a>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-1/4 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-xl text-red-600 font-bold mb-4 text-center">Other Articles</h3>
          <ul className="space-y-4">
            {faqs.map((item) => (
              <li key={item.id} className="flex flex-col">
                <div
                  className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100 transition"
                  onClick={() => toggleDropdown(item.id)}
                >
                  <span className="text-red-600 font-medium">
                    🔹 {language === "hindi" ? item.hindi : item.title}
                  </span>
                </div>

                {expandedArticle === item.id && (
                  <div className="bg-gray-50 border-l-4 border-red-600 mt-2 ml-4 p-3 rounded-lg shadow-inner">
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {(language === "hindi" ? item.dhindi : item.denglish)?.split(" ").slice(0, 40).join(" ") + "..."}
                    </p>
                    <Link
                      to={`/article/${item.id}`}
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

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          {isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          <aside
            className={`fixed top-0 left-0 h-full bg-white shadow-lg border-r border-gray-200 transition-transform duration-300 z-50 ${isOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"
              }`}
          >
            <div className="p-6">
              <h3 className="text-xl text-red-600 font-bold mb-4 text-center">Other Articles</h3>
              <ul className="space-y-4">
                {faqs.map((item) => (
                  <li key={item.id} className="flex flex-col">
                    <div
                      className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100 transition"
                      onClick={() => toggleDropdown(item.id)}
                    >
                      <span className="text-red-600 font-medium">
                        🔹 {language === "hindi" ? item.hindi : item.title}
                      </span>
                    </div>

                    {expandedArticle === item.id && (
                      <div className="bg-gray-50 border-l-4 border-red-600 mt-2  p-3 rounded-lg shadow-inner">
                        <p className="text-gray-800 text-xs  leading-relaxed">
                          {(language === "hindi" ? item.dhindi : item.denglish)?.split(" ").slice(0, 40).join(" ") + "..."}
                        </p>
                        <Link
                          to={`/article/${item.id}`}
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

      {/* Related Articles */}
      <div className="container mx-auto py-8 px-4 md:px-20">
        <h1 className="text-xl md:text-4xl  text-red-600 font-bold text-center mb-6">Related Articles</h1>
        <div className="grid grid-cols-1 gap-6">
          {faqs.slice(0, 6).map((faq, index) => (
            <div key={faq.id} className="bg-white border rounded-xl shadow-lg p-6">
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left text-xs font-semibold text-red-600 flex justify-between items-center"
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