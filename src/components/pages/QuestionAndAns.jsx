import React, { useEffect, useState } from "react";
import { FaWhatsapp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const QandASection = ({ courseName }) => {
  // State for Q&A videos
  const [videos, setVideos] = useState([]);

  // State for comments
  const [comments, setComments] = useState([]);
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  // Fetch Q&A videos from Firestore
  useEffect(() => {
    if (!courseName) return;

    const fetchVideoDetails = async () => {
      try {
        const qandaRef = collection(db, "questionAndAnswer");
        const q = query(qandaRef, where("courseName", "==", courseName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const fetchedVideos = querySnapshot.docs.map((doc) => doc.data());
          setVideos(fetchedVideos);
        } else {
          setVideos([]);
        }
      } catch (error) {
        console.error("Error fetching Q&A videos:", error);
      }
    };

    fetchVideoDetails();
  }, [courseName]);

  // Fetch comments in real time from Firestore
  useEffect(() => {
    if (!courseName) return;

    const commentsRef = collection(db, "Comments_Vahaly_Astro");
    const q = query(commentsRef, where("courseName", "==", courseName));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [courseName]);

  // Submit new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentName || !newCommentText) {
      alert("Please enter your name and comment.");
      return;
    }

    try {
      await addDoc(collection(db, "Comments_Vahaly_Astro"), {
        name: newCommentName,
        comment: newCommentText,
        courseName,
        timestamp: serverTimestamp(),
      });

      setNewCommentName("");
      setNewCommentText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <div className="mt-12 bg-white border-t-4 border-red-600 p-6 rounded shadow-lg">
      <h2 className="text-3xl font-bold text-red-600 mb-6 text-center">
        Questions & Answers
      </h2>

      {/* Q&A Video Section */}
      <div className="mt-6">
      {videos.length > 0 ? (
        <div className="relative">
          <button className=" custom-nav-btn left-0">
            <FaChevronLeft className="text-white  swiper-button-prev text-2xl" />
          </button>

           <Swiper
                    slidesPerView={1} // Show 1 slide for mobile
                    loop={true} // Enable infinite looping
                    breakpoints={{
                      640: { slidesPerView: 1, loop: true }, // Show 2 slides for larger mobile screens
                      1024: { slidesPerView: 1, loop: true }, // Show 3 slides for tablets and above
                    }}
                    spaceBetween={20} // Reduced space for better alignment on small screens
                    navigation={true} // Enable navigation arrows
                    pagination={{ clickable: true }} // Enable pagination dots
                    modules={[Navigation, Pagination]}
                    className="max-w-6xl mb-20"
                  >
            {videos.map((video, index) => (
              <SwiperSlide key={index}>
              <div className="mb-10 px-4 md:px-0">
  <div className="w-full md:w-3/4 lg:w-2/3">
    <video
      src={video.videoUrl}
      controls
      className="w-full h-auto max-h-[200px] bg-black rounded-lg shadow"
    />
    <div className="mt-4">
      <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
        {video.title}
      </h3>
      <p className="text-base md:text-lg text-gray-600">{video.subTitle}</p>
    </div>
  </div>
</div>

              </SwiperSlide>
            ))}
          </Swiper>

          <button className=" custom-nav-btn right-0">
            <FaChevronRight className="swiper-button-next text-white text-2xl " />
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-600">
          No Q&A videos available for this course.
        </p>
      )}
      </div>

      

    </div>
  );
};

export default QandASection;
