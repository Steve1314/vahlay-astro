
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { PieChart } from "react-minimal-pie-chart";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseConfig";

const PersonalCourse = () => {
  const { courseName } = useParams();
  const [videos, setVideos] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchedVideos, setWatchedVideos] = useState(0);
  const [validityPercentage, setValidityPercentage] = useState("0");
  const [totalVideos, setTotalVideos] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const modulesCoveredPercentage = Math.round((watchedVideos / totalVideos) * 100);
  const [activeVideo, setActiveVideo] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [courseType, setCourseType] = useState(null);

  const [formData, setFormData] = useState({
    profilePic: "",
    fullName: "NA",
    fathersName: "NA",
    mothersName: "NA",
    dob: "NA",
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

        const videosRef = collection(db, `videos_${courseName}`);
        const videosSnapshot = await getDocs(videosRef);
        const fetchedVideos = videosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(fetchedVideos);
        setTotalVideos(fetchedVideos.length);

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
                  const validityPercent = Math.floor((daysLeft / totalDays) * 100);
                  setValidityPercentage(validityPercent.toString());
                } else {
                  setValidityPercentage("0");
                }
              }

              const watched = courseInfo.watchedVideos || 0;
              setWatchedVideos(watched);
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
  }, [courseName, userEmail]);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser);

      // Fetch user profile from Firestore
      const fetchProfile = async () => {
        const userDocRef = doc(db, "students", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            profilePic: userData.profilePic || "",
            fullName: userData.fullName || "NA",
            fathersName: userData.fathersName || "NA",
            mothersName: userData.mothersName || "NA",
            dob: userData.dob || "NA",
            email: currentUser.email || "NA",
          });
        } else {
          // If user profile doesn't exist, set default values
          setFormData({
            profilePic: "",
            fullName: "NA",
            fathersName: "NA",
            mothersName: "NA",
            dob: "NA",
            email: currentUser.email || "NA",
          });
        }

        setLoading(false); // Set loading to false once the profile is fetched
      };

      fetchProfile();
    } else {
      setLoading(false); // In case no user is logged in, stop loading
    }
  }, [db]); // Dependency array ensures it only runs once on mount

  // Subscription Validity Component
  const SubscriptionValidity = () => {
    if (courseType === "free") {
      return null;
    }

    return (
      <div className="bg-red-100 p-4 rounded-lg shadow-md">
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
      
  // Mark video as watched and persist in Firestore
  const handleMarkAsWatched = async (videoId) => {
    try {
      const newWatchedCount = watchedVideos + 1;
      setWatchedVideos(newWatchedCount);

      if (userEmail) {
        const userSubscriptionRef = doc(db, "subscriptions", userEmail);
        const subscriptionSnapshot = await getDoc(userSubscriptionRef);

        if (subscriptionSnapshot.exists()) {
          const subscriptionData = subscriptionSnapshot.data();
          const updatedDetails = subscriptionData.DETAILS.map((detail) => {
            const courseKey = Object.keys(detail)[0];
            if (courseKey === courseName) {
              return {
                [courseKey]: {
                  ...detail[courseKey],
                  watchedVideos: newWatchedCount,
                },
              };
            }
            return detail;
          });

          await updateDoc(userSubscriptionRef, { DETAILS: updatedDetails });
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

  // Fetch meeting URL
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        const courseDoc = doc(db, "courseMeetings", courseName);
        const courseSnapshot = await getDoc(courseDoc);

        if (courseSnapshot.exists()) {
          const data = courseSnapshot.data();
          setMeetingUrl(data.meetingUrl?.trim());
        } else {
          console.error(`No document found for course: ${courseName}`);
        }
      } catch (error) {
        console.error("Error fetching meeting details:", error);
      }
    };

    fetchMeetingDetails();
  }, [courseName]);

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
            className="rounded-full mb-4 w-24 h-24 object-cover"
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
      <main className="flex-1 p-4 md:p-6">
        {/* Course Heading */}
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-red-600 text-center">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <SubscriptionValidity />

          {/* Modules Covered */}
          <div className="bg-red-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
              Modules Covered
            </h3>
            <PieChart
              data={[
                { title: "Watched", value: watchedVideos, color: "#fcfafa" },
                {
                  title: "Remaining",
                  value: totalVideos - watchedVideos,
                  color: "#FF5252",
                },
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
            <p className="text-center mt-2 text-red-700">
              {watchedVideos}/{totalVideos} Modules Covered (
              {modulesCoveredPercentage}%)
            </p>
          </div>

          {/* Study Materials */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
              Study Materials
            </h3>
            <div className="flex flex-col gap-4">
              {studyMaterials.map((material) => (
                <div key={material.id} className="p-2 bg-gray-100 rounded shadow">
                  <h4 className="text-gray-700 font-semibold">
                    {material.title}
                  </h4>
                  <a
                    href={material.url}
                    download
                    className="text-blue-500 hover:underline"
                    onClick={() =>
                      alert(`You have successfully downloaded ${material.title}!`)
                    }
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

             {/* Videos Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
           <h2 className="text-lg md:text-xl font-semibold mb-6 text-red-600 text-center">
             Videos
           </h2>
           <div className="grid grid-cols-1 gap-4 md:gap-6">
            {videos.map((video) => (
               <div
                 key={video.id}
                className="bg-white shadow-md rounded-lg p-3 md:p-4"
              >
                 <h3
                  className="text-base md:text-lg font-semibold mb-2 text-gray-700 cursor-pointer flex justify-between items-center"
                   onClick={() => toggleVideoVisibility(video.id)}                >
                   {video.title}
                  <span className="ml-2 text-gray-500">
                    {activeVideo === video.id ? "▲" : "▼"}
                  </span>
                 </h3>
                 {activeVideo === video.id && (
                 <video
                    src={video.url}
                    controls
                    className="w-full h-48 md:h-56 bg-black rounded"
                   controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    onEnded={() => handleMarkAsWatched(video.id)}
                  >
                     Your browser does not support the video tag.
                  </video>
             )}
              </div>
            ))}
          </div>
         </div>
       </main>
     </div>
   );
 };

export default PersonalCourse;