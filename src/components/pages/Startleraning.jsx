import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { PieChart } from "react-minimal-pie-chart";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebaseConfig";
import QandASection from "./QuestionAndAns"; // Your Q&A section component
import '@whereby.com/browser-sdk/embed';
import Draggable from 'react-draggable';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Aside from '../pages/Aside'

const PersonalCourse = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [validityPercentage, setValidityPercentage] = useState("0");
  const [totalVideos, setTotalVideos] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [iframeUrl, setIframeUrl] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [courseType, setCourseType] = useState(null);
  const [groupedVideos, setGroupedVideos] = useState({});
  const [upcomingEMIs, setUpcomingEMIs] = useState([]);

  const [formData, setFormData] = useState({
    profilePic: "",
    email: "NA",
  });

  const auth = getAuth();

  /**
   * -----------------------
   *  FETCH COURSE DATA
   * -----------------------
   */
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setVideos([]);
      setStudyMaterials([]);

      try {
        // Check course type (free or paid)
        const courseDoc = doc(db, "freeCourses", courseName);
        const courseSnapshot = await getDoc(courseDoc);
        if (courseSnapshot.exists()) {
          setCourseType(courseSnapshot.data().type);
        }

        // Fetch Videos
        const videosRef = collection(db, `videos_${courseName}`);
        const videosSnapshot = await getDocs(videosRef);
        const fetchedVideos = videosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(fetchedVideos);
        setTotalVideos(fetchedVideos.length);

        // Group videos by `title` and sort them by `title-order` and `order`
        const grouped = {};
        const titleOrders = {};
        fetchedVideos.forEach((video) => {
          const title = video.title.trim();
          const titleOrder = video["title-order"] || 999;
          const videoOrder = video.order || 999;

          if (!grouped[title]) {
            grouped[title] = [];
            titleOrders[title] = titleOrder;
          }
          grouped[title].push({ ...video, videoOrder });
        });

        const sortedGroups = Object.keys(grouped)
          .sort((a, b) => titleOrders[a] - titleOrders[b])
          .reduce((acc, key) => {
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

        // Check subscription details if user is logged in
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


  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const snap = await getDocs(collection(db, 'meetings'));
        const allMeetings = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Filter meeting by courseName
        const courseMeeting = allMeetings.find(
          (m) => m.courseId === courseName
        );

        if (courseMeeting && courseMeeting.viewerRoomUrl) {
          setMeetingUrl(courseMeeting.viewerRoomUrl);
        }
      } catch (err) {
        console.error('Error fetching meetings:', err);
      }
    };

    fetchMeetings();
  }, [courseName]);

  const handleOpenPopup = (url) => {
    setIframeUrl(url);
    setShowIframe(true);
    setIsFullscreen(false);
    localStorage.setItem('liveMeeting', JSON.stringify({ url, isFullscreen: false }));
  };

  const handleClosePopup = () => {
    setShowIframe(false);
    setIframeUrl('');
    setIsFullscreen(false);
    localStorage.removeItem('liveMeeting');
  };

  console.log(meetings)
  /**
   * -----------------------
   *  FETCH EMI DETAILS
   * -----------------------
   */
  useEffect(() => {
    const fetchEMIDetails = async () => {
      if (!userEmail) return;

      try {
        const paymentsRef = collection(db, "payments");
        const q1 = query(paymentsRef, where("userId", "==", userEmail));
        const querySnapshot = await getDocs(q1);

        const emiDetails = [];

        for (const paymentDoc of querySnapshot.docs) {
          const paymentData = paymentDoc.data();

          // Get EMI plan details
          const emiPlanRef = doc(db, "emiPlans", paymentData.planId);
          const emiPlanSnap = await getDoc(emiPlanRef);

          if (emiPlanSnap.exists()) {
            const emiPlan = emiPlanSnap.data();
            const totalEMIs = emiPlan.duration;

            // Find latest paid EMI number
            const paidEMIs = await getDocs(
              query(
                collection(db, "payments"),
                where("userId", "==", userEmail),
                where("planId", "==", paymentData.planId),
                where("status", "==", "paid")
              )
            );

            const nextEMINumber = paidEMIs.size + 1;

            if (nextEMINumber <= totalEMIs) {
              // Calculate due date (example: monthly payments)
              const lastPaymentDate =
                paymentData.timestamp?.toDate() || new Date();
              const dueDate = new Date(lastPaymentDate);
              dueDate.setMonth(dueDate.getMonth() + (nextEMINumber - 1));

              // Calculate days remaining
              const today = new Date();
              const timeDiff = dueDate.getTime() - today.getTime();
              const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

              emiDetails.push({
                courseId: paymentData.courseId,
                emiNumber: nextEMINumber,
                dueDate,
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                amountDue: emiPlan.amount,
                planId: paymentData.planId,
              });
            }
          }
        }

        // Sort by days remaining ascending
        setUpcomingEMIs(emiDetails.sort((a, b) => a.daysRemaining - b.daysRemaining));
      } catch (error) {
        console.error("Error fetching EMI details:", error);
      }
    };

    fetchEMIDetails();
  }, [userEmail]);

  /**
   * -----------------------
   *  SUBSCRIPTION VALIDITY
   * -----------------------
   */
  const SubscriptionValidity = () => {
    if (courseType === "free") {
      // For free courses, no subscription validity chart
      return null;
    }

    return (
      <div className="bg-red-100 p-4 rounded-lg shadow-md w-72 h-auto">
        <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
          Subscription Validity
        </h3>
        {typeof validityPercentage === "string" &&
          validityPercentage === "Lifetime Access" ? (
          <p className="text-center text-xl text-red-700">Lifetime Access</p>
        ) : validityPercentage === "0" ? (
          <p className="text-center text-xl text-red-700">Expired</p>
        ) : (
          <div>
            <PieChart
              data={[
                {
                  title: "Remaining",
                  value: parseInt(validityPercentage) || 0,
                  color: "#FF5252",
                },
                {
                  title: "Expired",
                  value: 100 - (parseInt(validityPercentage) || 0),
                  color: "#fcfafa",
                },
              ]}
              lineWidth={20}
              rounded
              animate
            />
            <p className="text-center mt-2 text-red-700">
              {validityPercentage || 0}% Validity Remaining
            </p>
          </div>
        )}
      </div>
    );
  };

  /**
   * -----------------------
   *  REAL-TIME WATCHED VIDEOS
   * -----------------------
   */
  useEffect(() => {
    if (!userEmail || courseType === "free") return;

    const userSubscriptionRef = doc(db, "subscriptions", userEmail);
    const unsubscribe = onSnapshot(userSubscriptionRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const subscriptionData = docSnapshot.data();
        console.log(subscriptionData)
        const courseDetails = subscriptionData.DETAILS.find(

          (detail) => Object.keys(detail)[0] === courseName

        );
        if (courseDetails) {
          const watchedVideosList = courseDetails[courseName].watchedVideos || [];
          setWatchedVideos(watchedVideosList);
        }
      }
    });
    return () => unsubscribe();
  }, [courseName, userEmail, courseType]);

  /**
   * -----------------------
   *  MODULES COVERED
   * -----------------------
   */
  const calculateModulesCovered = () => {
    if (courseType === "free") return 0;
    if (!groupedVideos || !watchedVideos) return 0;

    let modulesCovered = 0;
    const moduleTitles = Object.keys(groupedVideos);

    moduleTitles.forEach((title) => {
      const videosInModule = groupedVideos[title];
      const totalVideosInModule = videosInModule.length;
      const watchedVideosInModule = videosInModule.filter((video) =>
        watchedVideos.includes(video.id)
      ).length;
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

  /**
   * -----------------------
   *  COURSE PROGRESS (VIDEOS)
   * -----------------------
   */
  const calculateWatchedPercentage = () => {
    if (courseType === "free") return 0;
    if (totalVideos === 0) return 0;
    return Math.round((watchedVideos.length / totalVideos) * 100);
  };
  const watchedPercentage = calculateWatchedPercentage();

  /**
   * -----------------------
   *  MARK VIDEO AS WATCHED
   * -----------------------
   */
  const handleMarkAsWatched = async (videoId) => {
    if (!userEmail || courseType === "free") return;

    try {
      const userSubscriptionRef = doc(db, "subscriptions", userEmail);
      const subscriptionSnapshot = await getDoc(userSubscriptionRef);

      if (subscriptionSnapshot.exists()) {
        const subscriptionData = subscriptionSnapshot.data();
        const courseDetails = subscriptionData.DETAILS.find(
          (detail) => Object.keys(detail)[0] === courseName
        );
        if (courseDetails) {
          const updatedWatchedVideos = courseDetails[courseName].watchedVideos || [];
          if (!updatedWatchedVideos.includes(videoId)) {
            updatedWatchedVideos.push(videoId);

            const updatedDetails = subscriptionData.DETAILS.map((detail) => {
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
            setWatchedVideos(updatedWatchedVideos);
          }
        }
      }
    } catch (error) {
      console.error("Error updating watched videos:", error);
    }
  };

  /**
   * -----------------------
   *  TRACK LOGGED-IN USER
   * -----------------------
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserEmail(currentUser.email);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  /**
   * -----------------------
   *  FETCH LATEST MEETING
   * -----------------------
   */
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const meetingsRef = collection(db, 'meetings');
        const q = query(meetingsRef, where('courseId', '==', courseName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const meetingDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMeetings(meetingDocs);
        } else {
          setMeetings([]);
        }
      } catch (err) {
        console.error('Error fetching meetings:', err);
      }
    };

    if (courseName) {
      fetchMeetings();
    }
  }, [courseName]);
  console.log(meetings)
  /**
   * -----------------------
   *  JOIN LIVE SESSION
   * -----------------------
   */
  const handleRedirect = () => {
    if (meetings.length > 0) {
      const latestMeeting = meetings[meetings.length - 1];
      const url = latestMeeting.viewerRoomUrl || latestMeeting.ringCentralMeeting?.viewerRoomUrl;
      if (url && url.startsWith("http")) {
        setIframeUrl(url);
        setShowIframe(true);
      } else {
        alert("Valid meeting URL not found.");
      }
    } else {
      alert("No meeting found for this course.");
    }
  };




  /**
   * -----------------------
   *  LOADING STATE
   * -----------------------
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500"></div>
      </div>
    );
  }

  /**
   * -----------------------
   *  NO DATA
   * -----------------------
   */
  if (!videos.length && !studyMaterials.length) {
    return (
      <div className="text-center mt-10 text-red-500">
        No data found for <strong>{courseName}</strong>.
      </div>
    );
  }

  /**
   * -----------------------
   *  RENDER COMPONENT
   * -----------------------
   */
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* SIDEBAR */}
      <Aside />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 lg:p-6">
        {/* Course Name */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-red-600 text-center">
          {courseName}
        </h1>

        {/* Live Session Marquee */}
        {meetings.length > 0 && (
          <Link to={`/${courseName}/meetings`}>
            <div className="bg-orange-100 p-2 mb-4 rounded">

              Click Here to join Live Session for {courseName}

            </div>
          </Link>
        )}






        {/* Upcoming EMI Payments */}
        {upcomingEMIs.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Upcoming EMI Payments
            </h3>
            {upcomingEMIs.map((emi, index) => (
              <div key={index} className="p-3 bg-red-50 rounded mb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Course: {emi.courseId}</h4>
                    <p>EMI #{emi.emiNumber} Due</p>
                    <p className="text-sm text-gray-600">
                      Due Date: {emi.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg ${emi.daysRemaining <= 3 ? "text-red-500" : "text-green-600"
                        }`}
                    >
                      {emi.daysRemaining} days left
                    </p>
                    <p className="font-bold">₹{emi.amountDue}</p>
                  </div>
                </div>
                <Link
                  to={`/finalize`}
                  className="mt-2 block w-auto bg-red-600 text-white py-2 text-center rounded hover:bg-red-700"
                >
                  Pay Now
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Top Row: Validity, Progress, Modules, Study Materials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2 md:px-6 mb-6">
          {/* Subscription Validity (Paid Courses) */}
          {courseType !== "free" && (
            <div className="bg-pink-100 p-4 rounded-lg shadow-md flex flex-col items-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Subscription Validity
              </h3>
              {typeof validityPercentage === "string" && validityPercentage === "Lifetime Access" ? (
                <p className="text-center text-xl text-red-700">Lifetime Access</p>
              ) : validityPercentage === "0" ? (
                <p className="text-center text-xl text-red-700">Expired</p>
              ) : (
                <>
                  <div className="flex items-center justify-center" style={{ width: "140px", height: "140px" }}>
                    <PieChart
                      data={[
                        {
                          title: "Remaining",
                          value: parseInt(validityPercentage) || 0,
                          color: "#FF5252",
                        },
                        {
                          title: "Expired",
                          value: 100 - (parseInt(validityPercentage) || 0),
                          color: "#FCECEC", // a lighter shade of pink
                        },
                      ]}
                      lineWidth={25}
                      rounded
                      animate
                      style={{ height: "140px", width: "140px" }}
                      label={({ dataEntry }) => dataEntry.value > 0 ? `${dataEntry.value}%` : null}
                      labelStyle={{
                        fontSize: "10px",
                        fill: "#000",
                        fontWeight: "bold",

                      }}
                      labelPosition={20}
                    />
                  </div>
                  <p className="text-center mt-2 text-red-700">
                    {validityPercentage || 0}% Validity Remaining
                  </p>
                </>
              )}
            </div>
          )}

          {/* Course Progress */}
          <div className="bg-pink-100 p-4 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Course Progress
            </h3>
            {courseType !== "free" ? (
              <>
                <div className="flex items-center justify-center" style={{ width: "140px", height: "140px" }}>
                  <PieChart
                    data={[
                      { title: "Watched", value: watchedPercentage, color: "#FF5252" },
                      { title: "Remaining", value: 100 - watchedPercentage, color: "#FCECEC" },
                    ]}
                    lineWidth={25}
                    rounded
                    animate
                    style={{ height: "140px", width: "140px" }}
                    label={({ dataEntry }) => dataEntry.value > 0 ? `${dataEntry.value}%` : null}
                    labelStyle={{
                      fontSize: "10px",
                      fill: "#000",
                      fontWeight: "bold",
                    }}
                    labelPosition={20}
                  />
                </div>
                <p className="text-center mt-2 text-red-700">
                  {watchedVideos.length}/{totalVideos} Videos Watched ({watchedPercentage}%)
                </p>
              </>
            ) : (
              <p className="text-center text-red-700 mt-4">
                Progress tracking is not available for free courses.
              </p>
            )}
          </div>

          {/* Modules Covered (Paid Courses) */}
          {courseType !== "free" && totalModules > 0 && (
            <div className="bg-pink-100 p-4 rounded-lg shadow-md flex flex-col items-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Modules Covered
              </h3>
              <div className="flex items-center justify-center" style={{ width: "140px", height: "140px" }}>
                <PieChart
                  data={[
                    { title: "Covered", value: modulesCovered, color: "#FF5252" },
                    {
                      title: "Remaining",
                      value: totalModules - modulesCovered,
                      color: "#FCECEC",
                    },
                  ]}
                  lineWidth={25}
                  rounded
                  animate
                  style={{ height: "140px", width: "140px" }}
                  label={({ dataEntry }) => dataEntry.value > 0 ? `${dataEntry.value}%` : null}
                  labelStyle={{
                    fontSize: "10px",
                    fill: "#000",
                    fontWeight: "bold",
                  }}
                  labelPosition={20}
                />
              </div>
              <p className="text-center mt-2 text-red-700">
                {modulesCovered}/{totalModules} Modules Covered ({modulesCoveredPercentage}%)
              </p>
            </div>
          )}

          {/* Study Materials */}
          {studyMaterials.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
              <h3 className="text-lg font-semibold text-center text-red-600 mb-2">
                Study Materials
              </h3>
              <div className="space-y-2">
                {studyMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="p-2 bg-gray-100 rounded shadow flex flex-col items-start"
                  >
                    <h4 className="text-gray-700 font-semibold mb-1">
                      {material.title}
                    </h4>
                    <a
                      href={material.url}
                      download
                      className="text-white bg-blue-500 px-4 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* COURSE VIDEOS */}
        <div className="px-2 md:px-6 mb-8">
          <h2 className="text-xl font-bold text-red-600 mb-4">Course Videos</h2>
          {Object.keys(groupedVideos).map((title, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {title}
              </h3>

              {/* Swiper Container */}
              <div className="relative">
                {/* Left Nav */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                  <button>
                    <FaChevronLeft className="swiper-button-prev text-red-600 bg-white rounded-full p-1 shadow" />
                  </button>
                </div>
                <div className="max-w-3xl ">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation={{
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                    }}
                    pagination={{ clickable: true }}
                    spaceBetween={10}
                    slidesPerView={1}
                    breakpoints={{
                      640: { slidesPerView: 2 },
                      1024: { slidesPerView: 3 },
                    }}
                    className="max-w-7xl "
                  >
                    {groupedVideos[title].map((video) => (
                      <SwiperSlide key={video.id} className="mb-8">
                        <div className="bg-white shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 mb-6px">
                          <Link to={`/course/${courseName}/video/${video.id}`}>
                            <video
                              src={video.url}
                              controls
                              className="w-full h-40 bg-black rounded"
                              controlsList="nodownload"
                              onEnded={() => handleMarkAsWatched(video.id)}
                            />
                            <div className="p-3">
                              <p className="text-red-700 font-semibold text-sm truncate ">
                                {video.description}
                              </p>
                            </div>
                          </Link>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Right Nav */}
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                  <button>
                    <FaChevronRight className="swiper-button-next text-red-600 bg-white rounded-full p-1 shadow" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* Q&A SECTION */}
        <div className="px-2 md:px-6 mb-8">
          <QandASection courseName={courseName} />
        </div>


      </main>
    </div>

  );
};

export default PersonalCourse;
