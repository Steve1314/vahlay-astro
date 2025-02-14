
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc, updateDoc, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { PieChart } from "react-minimal-pie-chart";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseConfig";
import QandASection from "./QuestionAndAns"; // Import the Q&A section component



import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


const PersonalCourse = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchedVideos, setWatchedVideos] = useState([]); // Track watched video IDs (only for paid courses)
  const [validityPercentage, setValidityPercentage] = useState("0");
  const [totalVideos, setTotalVideos] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [courseType, setCourseType] = useState(null);
  const [groupedVideos, setGroupedVideos] = useState({});


  const [selectedTitle, setSelectedTitle] = useState("");
  const [titles, setTitles] = useState([]);


  const [formData, setFormData] = useState({
    profilePic: "",

    email: "NA",
  });

  const auth = getAuth();

  // Fetch data for the course
  useEffect(() => {
    const fetchCourseData = async () => {
      setVideos([]);
      setStudyMaterials([]);
      setLoading(true);
  
      try {
        const courseDoc = doc(db, "freeCourses", courseName);
        const courseSnapshot = await getDoc(courseDoc);
  
        if (courseSnapshot.exists()) {
          setCourseType(courseSnapshot.data().type);
        }
  
        // Fetch Videos from Firestore
        const videosRef = collection(db, `videos_${courseName}`);
        const videosSnapshot = await getDocs(videosRef);
  
        // 1. Fetch and store videos with title & order
        const fetchedVideos = videosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setVideos(fetchedVideos);
        setTotalVideos(fetchedVideos.length);
  
        // 2. Group videos by title and track title-order values
        const grouped = {};
        const titleOrders = {}; // Store `title-order` for sorting sections
  
        fetchedVideos.forEach((video) => {
          const title = video.title.trim();
          const titleOrder = video["title-order"] || 999; // Default large number if missing
          const videoOrder = video.order || 999; // Default large number if missing
  
          if (!grouped[title]) {
            grouped[title] = [];
            titleOrders[title] = titleOrder; // Store the order of the title
          }
  
          grouped[title].push({ ...video, videoOrder }); // Store videos inside titles
        });
  
        // 3. Sort titles based on `title-order`
        const sortedGroups = Object.keys(grouped)
          .sort((a, b) => titleOrders[a] - titleOrders[b]) // Sorting by title-order
          .reduce((acc, key) => {
            // 4. Sort videos within each title by `order` field
            acc[key] = grouped[key].sort((a, b) => a.videoOrder - b.videoOrder);
            return acc;
          }, {});
  
        setGroupedVideos(sortedGroups);
  
        // Fetch Study Materials
        const materialsRef = collection(db, `materials_${courseName}`);
        const materialsSnapshot = await getDocs(materialsRef);
        const fetchedMaterials = materialsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudyMaterials(fetchedMaterials);
  
        if (userEmail) {
          const userSubscriptionRef = doc(db, "subscriptions", userEmail);
          const subscriptionSnapshot = await getDoc(userSubscriptionRef);
  
          if (subscriptionSnapshot.exists()) {
            const subscriptionData = subscriptionSnapshot.data();
  
            if (courseType === "free") {
              if (
                subscriptionData.freecourses &&
                subscriptionData.freecourses.includes(courseName)
              ) {
                setWatchedVideos([]);
              }
            } else {
              const courseDetails = subscriptionData.DETAILS.find(
                (detail) => Object.keys(detail)[0] === courseName
              );
  
              if (courseDetails) {
                const courseInfo = courseDetails[courseName];
                const isFreeCourse = courseInfo.isFree;
  
                if (isFreeCourse) {
                  setValidityPercentage(null);
                } else {
                  let daysLeft = 0;
                  let usedDays = 0;
                  let totalDays = 0;
  
                  if (courseInfo.subscriptionDate && courseInfo.expiryDate) {
                    const subDate = new Date(courseInfo.subscriptionDate);
                    const expDate = new Date(courseInfo.expiryDate);
                    const now = new Date();
  
                    const totalTime = expDate.getTime() - subDate.getTime();
                    totalDays = Math.floor(totalTime / (1000 * 3600 * 24));
  
                    const usedTime = now.getTime() - subDate.getTime();
                    usedDays =
                      usedTime > 0
                        ? Math.floor(usedTime / (1000 * 3600 * 24))
                        : 0;
  
                    const rawDaysLeft = totalDays - usedDays;
                    daysLeft = rawDaysLeft < 0 ? 0 : rawDaysLeft;
                  }
  
                  if (totalDays > 0) {
                    const validityPercent = Math.floor(
                      (daysLeft / totalDays) * 100
                    );
                    setValidityPercentage(validityPercent.toString());
                  } else {
                    setValidityPercentage("0");
                  }
                }
  
                setWatchedVideos(courseInfo.watchedVideos || []);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourseData();
  }, [courseName, userEmail, courseType]);
  

  const SubscriptionValidity = () => {
    if (courseType === "free") {
      return null;
    }

    return (
      <div className="bg-red-100 p-4 rounded-lg shadow-md w-72 h-auto ">
        <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
          Subscription Validity
        </h3>
        {typeof validityPercentage === "string" && validityPercentage === "Lifetime Access" ? (
          <p className="text-center text-xl text-red-700">Lifetime Access</p>
        ) : validityPercentage === "0" ? (
          <p className="text-center text-xl text-red-700">Expired</p>
        ) : (
          <div>
            <PieChart
              data={[
                { title: "Remaining", value: parseInt(validityPercentage), color: "#FF5252" },
                { title: "Expired", value: 100 - parseInt(validityPercentage), color: "#fcfafa" },
              ]}
              lineWidth={20}
              rounded
              animate
            />
            <p className="text-center mt-2 text-red-700">
              {validityPercentage}% Validity Remaining
            </p>
          </div>
        )}
      </div>
    );
  };

  // Track watched videos in real-time (only for paid courses)
  useEffect(() => {
    if (!userEmail || courseType === "free") return;

    const userSubscriptionRef = doc(db, "subscriptions", userEmail);

    // ✅ Listen for real-time updates
    const unsubscribe = onSnapshot(userSubscriptionRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        let subscriptionData = docSnapshot.data();
        let courseDetails = subscriptionData.DETAILS.find(
          (detail) => Object.keys(detail)[0] === courseName
        );

        if (courseDetails) {
          let watchedVideosList = courseDetails[courseName].watchedVideos || [];
          setWatchedVideos(watchedVideosList);
        }
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [courseName, userEmail, courseType]);

  // Calculate modules covered dynamically (only for paid courses)
  const calculateModulesCovered = () => {
    if (courseType === "free") return 0;
    if (!groupedVideos || !watchedVideos) return 0;

    let modulesCovered = 0;

    // Iterate through each module (title)
    Object.keys(groupedVideos).forEach((title) => {
      const videosInModule = groupedVideos[title];
      const totalVideosInModule = videosInModule.length;

      // Count how many videos in this module are watched
      const watchedVideosInModule = videosInModule.filter((video) =>
        watchedVideos.includes(video.id)
      ).length;

      // If all videos in the module are watched, consider it covered
      if (watchedVideosInModule === totalVideosInModule) {
        modulesCovered++;
      }
    });

    return modulesCovered;
  };

  const modulesCovered = calculateModulesCovered();
  const totalModules = Object.keys(groupedVideos).length;
  const modulesCoveredPercentage =
    totalModules > 0 ? Math.round((modulesCovered / totalModules) * 100) : 0;

  // Calculate percentage of watched videos (only for paid courses)
  const calculateWatchedPercentage = () => {
    if (courseType === "free") return 0;
    if (totalVideos === 0) return 0;
    return Math.round((watchedVideos.length / totalVideos) * 100);
  };

  const watchedPercentage = calculateWatchedPercentage();

  // Mark video as watched and persist in Firestore (only for paid courses)
  const handleMarkAsWatched = async (videoId) => {
    if (!userEmail) return;
    if (courseType === "free") {
      // For free courses, progress tracking is not available.
      return;
    }
    try {
      const userSubscriptionRef = doc(db, "subscriptions", userEmail);
      const subscriptionSnapshot = await getDoc(userSubscriptionRef);

      if (subscriptionSnapshot.exists()) {
        let subscriptionData = subscriptionSnapshot.data();
        let courseDetails = subscriptionData.DETAILS.find(
          (detail) => Object.keys(detail)[0] === courseName
        );

        if (courseDetails) {
          let updatedWatchedVideos = courseDetails[courseName].watchedVideos || [];

          // ✅ If video is already watched, do nothing
          if (!updatedWatchedVideos.includes(videoId)) {
            updatedWatchedVideos.push(videoId);

            // ✅ Update Firestore
            let updatedDetails = subscriptionData.DETAILS.map((detail) => {
              const courseKey = Object.keys(detail)[0];

              if (courseKey === courseName) {
                return {
                  [courseKey]: {
                    ...detail[courseKey],
                    watchedVideos: updatedWatchedVideos,
                  },
                };
              }
              return detail;
            });

            await updateDoc(userSubscriptionRef, { DETAILS: updatedDetails });

            // ✅ Update local state in real-time
            setWatchedVideos(updatedWatchedVideos);
          }
        }
      }
    } catch (error) {
      console.error("Error updating watched videos:", error);
    }
  };

  // Track logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserEmail(currentUser.email);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Fetch the latest meeting URL
  useEffect(() => {
    const fetchLatestMeeting = async () => {
      try {
        const meetingsRef = collection(db, "meetings"); // UPDATED HERE
        const q = query(meetingsRef, orderBy("createdAt", "desc"), limit(1)); // UPDATED HERE
        const querySnapshot = await getDocs(q); // UPDATED HERE

        if (!querySnapshot.empty) {
          const latestMeeting = querySnapshot.docs[0].data();
          setMeetingUrl(latestMeeting.link?.trim()); // UPDATED HERE
        } else {
          console.error("No recent meetings found");
        }
      } catch (error) {
        console.error("Error fetching latest meeting details:", error);
      }
    };

    fetchLatestMeeting();
  }, []);

  const handleRedirect = () => {
    if (meetingUrl) {
      const validUrl = meetingUrl.startsWith("http")
        ? meetingUrl
        : `https://${meetingUrl}`;
      window.open(validUrl, "_blank");
    } else {
      alert("Meeting URL is not available yet.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-red-500 font-bold">Loading...</div>
    );
  }

  if (!videos.length && !studyMaterials.length) {
    return (
      <div className="text-center mt-10 text-red-500">
        No data found for <strong>{courseName}</strong>.
      </div>
    );
  }

  const toggleVideoVisibility = (id) => {
    setActiveVideo((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-64 bg-red-600 text-white
          shadow-lg z-10 transform transition-transform
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative
        `}
      >
        {/* Header (visible on sidebar) */}
        <div className="flex justify-between items-center p-4 border-b border-red-500">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-2xl font-bold"
          >
            ✖
          </button>
        </div>

        {/* Profile Info */}
        <div className="p-6 flex flex-col items-center">
          <img
            src={formData.profilePic || "https://via.placeholder.com/100"}
            alt="Profile"
            className="rounded-full mb-4 w-20 h-20 border-2 border-white"
          />
          <h2 className="text-lg font-bold">
            {user?.displayName || "User"}
          </h2>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-6 space-y-4">
          <Link
            to="/profile"
            className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
          >
            My Profile
          </Link>
          <Link
            to="/dashboard"
            className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
          >
            Enrolled Courses
          </Link>
          <Link
            to="/courses"
            className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
          >
            Add Courses
          </Link>

          <Link
            to="/finalize"
            className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
          >
            Payment
          </Link>
        </nav>
      </aside>

      {/* Mobile-only "Hamburger" button to open sidebar */}
      <div className="md:hidden p-4 border-b border-gray-300 flex justify-between items-center">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-2xl font-bold"
        >
          ☰
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:p-6">
        {/* Course Heading */}
        <h1 className="text-2xl lg:text-4xl font-bold mb-6 text-red-600 text-center">
          {courseName}
        </h1>

        {/* Live Session Marquee */}
        <marquee behavior="" direction="" className="text-red-800 bg-orange-100 p-2 mb-4">
          <span
            onClick={handleRedirect}
            className="cursor-pointer text-blue-600 underline"
          >
            Click Here to join Live Session for {courseName}
          </span>
        </marquee>

        {/* Top Row: Charts and Study Materials */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 px-6 iteams-center">
          {courseType !== "free" && <SubscriptionValidity />}

          {/* Course Progress */}
          {courseType !== "free" ? (
            <div className="bg-red-100 p-4 rounded-lg shadow-md w-64 h-auto   ">
              <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
                Course Progress
              </h3>
              <div>
                <PieChart
                  data={[
                    { title: "Watched", value: watchedPercentage, color: "#FF5252" }, // Green for watched
                    { title: "Remaining", value: 100 - watchedPercentage, color: "#fcfafa" }, // Red for remaining
                  ]}
                  lineWidth={20}
                  rounded
                  animate
                  label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`} // Show percentage
                  labelStyle={{
                    fontSize: "6px",
                    fill: "#000",
                  }}
                  labelPosition={75}
                />
              </div>
              <p className="text-center mt-2 text-red-700">
                {watchedVideos.length}/{totalVideos} Videos Watched ({watchedPercentage}%)
              </p>
            </div>
          ) : (
            <div className="bg-red-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
                Course Progress
              </h3>
              <p className="text-center mt-2 text-red-700">
                Progress tracking is not available for free courses.
              </p>
            </div>
          )}

          {/* Modules Covered (only for paid courses) */}
          {courseType !== "free" && totalModules > 0 && (
            <div className="bg-red-100 p-4 rounded-lg shadow-md w-64 h-auto ">
              <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
                Modules Covered
              </h3>
              <div>
                <PieChart
                  data={[
                    { title: "Watched", value: modulesCovered, color: "#FF5252" },
                    { title: "Remaining", value: totalModules - modulesCovered, color: "#fcfafa" },
                  ]}
                  lineWidth={20}
                  rounded
                  animate
                  label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
                  labelStyle={{
                    fontSize: "6px",
                    fill: "#000",
                  }}
                  labelPosition={75}
                />
              </div>
              <p className="text-center mt-2 text-red-700">
                {modulesCovered}/{totalModules} Modules Covered ({modulesCoveredPercentage}%)
              </p>
            </div>
          )}

          {/* Show Study Materials Only if Available */}
          {studyMaterials.length > 0 && (
            <div className="bg-white p-4 w-64 h-auto rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
                Study Materials
              </h3>
              {studyMaterials.map((material) => (
                <div key={material.id} className="p-2 bg-gray-100 rounded shadow">
                  <h4 className="text-gray-700 font-semibold">{material.title}</h4>
                  <a
                    href={material.url}
                    download
                    className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos Section */}
        <div className="px-6 mt-8">
          <h2 className="text-xl font-bold text-red-600 mb-4">Course Videos</h2>
          {Object.keys(groupedVideos).map((title, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>

              {/* Swiper Container */}
              <div className="relative">
                {/* Left Navigation Button */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                  <button >
                    <FaChevronLeft className="swiper-button-prev   text-red-600 bg-white rounded-full" />
                  </button>
                </div>

                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                  }}
                  pagination={{ clickable: true }}
                  spaceBetween={10}
                  slidesPerView={1} // Default for mobile
                  breakpoints={{
                    640: { slidesPerView: 2 }, // Medium screen (2 videos)
                    1024: { slidesPerView: 5 }, // Large screen (5 videos)
                  }}
                  className="max-w-7xl "
                >
                  {groupedVideos[title].map((video) => (
                    <SwiperSlide key={video.id}>
                      <div className="bg-white  shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105">
                        <Link to={`/course/${courseName}/video/${video.id}`}>
                          <video
                            src={video.url}
                            controls
                            className="w-full h-40 bg-black rounded"
                            controlsList="nodownload"
                            onEnded={() => handleMarkAsWatched(video.id)}
                          />

                          <div className="p-3">

                            <Link to={`/course/${courseName}/video/${video.id}`}><p className="text-red-700 font-semibold text-sm truncate mb-6">{video.description}</p></Link>
                          </div>
                        </Link>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Right Navigation Button */}
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                  <button >
                    <FaChevronRight className=" swiper-button-next text-red-600 bg-white rounded-full    " />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ***** New Q&A Section ***** */}
        <QandASection courseName={courseName} />


      </main>
    </div>
  );
};

export default PersonalCourse;


