// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { collection, getDocs, doc, getDoc, updateDoc, onSnapshot, addDoc, serverTimestamp, increment, query, where } from "firebase/firestore";
// import { db, auth } from "../../firebaseConfig";
// import { onAuthStateChanged } from "firebase/auth";
// import ReactPlayer from 'react-player';

// const VideoDetailsPage = () => {
//     const { courseName, videoId } = useParams();
//     const navigate = useNavigate();
//     const [videos, setVideos] = useState([]);
//     const [activeVideo, setActiveVideo] = useState(null);
//     const [comments, setComments] = useState([]);
//     const [newComment, setNewComment] = useState("");
//     const [ads, setAds] = useState([]);
//     const [likes, setLikes] = useState(0);
//     const [userLiked, setUserLiked] = useState(false);
//     const [user, setUser] = useState(null);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [watchedVideos, setWatchedVideos] = useState([]);

//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             setUser(user);
//             if (user) {
//                 // Fetch watched videos
//                 const userSubRef = doc(db, "subscriptions", user.email);
//                 getDoc(userSubRef).then((docSnap) => {
//                     if (docSnap.exists()) {
//                         const courseData = docSnap.data().DETAILS.find(d => Object.keys(d)[0] === courseName);
//                         if (courseData) {
//                             setWatchedVideos(courseData[courseName].watchedVideos || []);
//                         }
//                     }
//                 });
//             }
//         });
//         return () => unsubscribe();
//     }, [courseName]);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 // Fetch active video details
//                 const videoRef = doc(db, `videos_${courseName}`, videoId);
//                 const videoSnap = await getDoc(videoRef);

//                 if (videoSnap.exists()) {
//                     const videoData = videoSnap.data();
//                     setActiveVideo({ id: videoSnap.id, ...videoData });
//                     setLikes(videoData.likes || 0);
//                 }

//                 // Fetch all course videos
//                 const videosRef = collection(db, `videos_${courseName}`);
//                 const videosSnapshot = await getDocs(videosRef);
//                 const allVideos = videosSnapshot.docs.map(doc => ({
//                     id: doc.id,
//                     ...doc.data(),
//                     thumbnail: doc.data().thumbnail || `https://img.youtube.com/vi/${extractYTId(doc.data().url)}/hqdefault.jpg`
//                 }));
//                 setVideos(allVideos);

//                 // Fetch ads
//                 const adsRef = collection(db, "ads");
//                 const adsSnapshot = await getDocs(adsRef);
//                 setAds(adsSnapshot.docs.map(doc => doc.data()));

//                 // Fetch comments
//                 const commentsQuery = query(
//                     collection(db, "Comments_Vahaly_Astro"),
//                     where("courseName", "==", courseName),
//                     where("videoId", "==", videoId)
//                 );

//                 const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
//                     const fetchedComments = snapshot.docs.map(doc => ({
//                         id: doc.id,
//                         ...doc.data(),
//                     }));
//                     setComments(fetchedComments.sort((a, b) => b.timestamp - a.timestamp));
//                 });

//                 setLoading(false);
//                 return () => unsubscribeComments();
//             } catch (err) {
//                 console.error("Error fetching data:", err);
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [courseName, videoId]);

//     const extractYTId = (url) => {
//         const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//         const match = url.match(regExp);
//         return (match && match[2].length === 11) ? match[2] : null;
//     };

//     const markVideoAsWatched = async () => {
//         if (!user) return;

//         try {
//             const userSubRef = doc(db, "subscriptions", user.email);
//             const docSnap = await getDoc(userSubRef);

//             if (docSnap.exists()) {
//                 const subscriptions = docSnap.data().DETAILS;
//                 const courseIndex = subscriptions.findIndex(d => Object.keys(d)[0] === courseName);

//                 if (courseIndex !== -1) {
//                     const updatedSubs = [...subscriptions];
//                     const watched = new Set(updatedSubs[courseIndex][courseName].watchedVideos || []);
//                     watched.add(videoId);

//                     updatedSubs[courseIndex][courseName].watchedVideos = Array.from(watched);

//                     await updateDoc(userSubRef, {
//                         DETAILS: updatedSubs
//                     });
//                     setWatchedVideos(Array.from(watched));
//                 }
//             }
//         } catch (err) {
//             console.error("Error marking video as watched:", err);
//         }
//     };

//     const handleVideoSelect = (video) => {
//         navigate(`/course/${courseName}/video/${video.id}`);
//     };

//     const handleCommentSubmit = async (e) => {
//         e.preventDefault();
//         if (!newComment.trim() || !user) return;

//         try {
//             await addDoc(collection(db, "Comments_Vahaly_Astro"), {
//                 courseName,
//                 videoId,
//                 comment: newComment.trim(),
//                 userName: user.displayName || "Anonymous",
//                 userId: user.uid,
//                 timestamp: serverTimestamp(),
//             });
//             setNewComment("");
//         } catch (err) {
//             console.error("Error submitting comment:", err);
//         }
//     };

//     const handleLike = async () => {
//         if (!user || userLiked) return;

//         try {
//             const videoRef = doc(db, `videos_${courseName}`, videoId);
//             await updateDoc(videoRef, {
//                 likes: increment(1)
//             });
//             setUserLiked(true);
//             setLikes(prev => prev + 1);
//         } catch (err) {
//             console.error("Error updating likes:", err);
//         }
//     };

//     const filteredVideos = videos.filter(video =>
//         video.description.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
//         {/* Main Content Section */}
//         <div className="w-full md:w-3/4 p-6">
//           {/* Video Player */}
//           <div className="bg-black rounded-xl overflow-hidden shadow-xl">
//             {activeVideo?.url ? (
//               <ReactPlayer
//                 url={activeVideo.url}
//                 controls
//                 width="100%"
//                 height="100%"
//                 onEnded={markVideoAsWatched}
//                 config={{
//                   file: {
//                     attributes: {
//                       controlsList: "nodownload"
//                     }
//                   }
//                 }}
//               />
//             ) : (
//               <div className="h-96 bg-gray-800 flex items-center justify-center">
//                 <p className="text-white">Video unavailable</p>
//               </div>
//             )}
//           </div>
      
//           {/* Video Info Section */}
//           <div className="mt-4 bg-white p-6 rounded-xl shadow">
//             <h1 className="text-2xl font-bold text-gray-800 mb-2">
//               {activeVideo?.description || "Untitled Video"}
//             </h1>
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={handleLike}
//                 className={`flex items-center px-4 py-2 rounded-full ${
//                   userLiked ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
//                 } hover:bg-red-50 transition-colors`}
//               >
//                 <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
//                 </svg>
//                 {likes.toLocaleString()}
//               </button>
//               <span className="text-sm text-gray-500">
//                 {watchedVideos.includes(videoId) ? "✓ Watched" : ""}
//               </span>
//             </div>
//           </div>
      
//           {/* Comments Section */}
//           <div className="mt-6 bg-white p-6 rounded-xl shadow">
//             <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
//             {user && (
//               <form onSubmit={handleCommentSubmit} className="mb-6 flex gap-4">
//                 <div className="flex-1">
//                   <input
//                     type="text"
//                     value={newComment}
//                     onChange={(e) => setNewComment(e.target.value)}
//                     placeholder="Add a public comment..."
//                     className="w-full p-3 border-b-2 border-gray-200 focus:outline-none focus:border-red-500"
//                   />
//                   <div className="mt-3 flex justify-end">
//                     <button
//                       type="submit"
//                       className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
//                     >
//                       Comment
//                     </button>
//                   </div>
//                 </div>
//               </form>
//             )}
      
//             <div className="space-y-4">
//               {comments.map((comment) => (
//                 <div key={comment.id} className="flex gap-4 items-start">
//                   <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
//                     <span className="font-medium">
//                       {comment.userName[0]?.toUpperCase()}
//                     </span>
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <h3 className="font-semibold">{comment.userName}</h3>
//                       <span className="text-gray-500 text-sm">
//                         {new Date(comment.timestamp?.toDate()).toLocaleDateString()}
//                       </span>
//                     </div>
//                     <p className="text-gray-800">{comment.comment}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
      
//         {/* Sidebar Section */}
//         <div className="w-full md:w-1/4 p-4 bg-white border-l md:sticky md:top-0">
//           {/* Search Bar */}
//           <div className="mb-6">
//             <input
//               type="text"
//               placeholder="Search in course..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
//             />
//           </div>
      
//           {/* Advertisements */}
//           {ads.length > 0 && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-gray-500 mb-2">Sponsored</h3>
//               {ads.map((ad, index) => (
//                 <a
//                   key={index}
//                   href={ad.link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="block mb-4 group"
//                 >
//                   <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
//                     <img
//                       src={ad.imageUrl}
//                       alt="Ad"
//                       className="w-full h-32 object-cover"
//                     />
//                     <div className="p-2">
//                       <p className="text-sm font-medium text-gray-700 group-hover:text-red-600">
//                         {ad.title}
//                       </p>
//                     </div>
//                   </div>
//                 </a>
//               ))}
//             </div>
//           )}
      
//           {/* Related Videos */}
//           <h3 className="text-lg font-semibold mb-4">Up Next</h3>
//           <div className="space-y-4">
//             {filteredVideos.map((video) => (
//               <div
//                 key={video.id}
//                 onClick={() => handleVideoSelect(video)}
//                 className={`flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg ${
//                   watchedVideos.includes(video.id) ? "bg-green-50" : ""
//                 }`}
//               >
//                 <img
//                   src={video.thumbnail}
//                   alt="Thumbnail"
//                   className="w-24 h-16 rounded-lg object-cover"
//                   onError={(e) => {
//                     e.target.src = 'https://via.placeholder.com/120x68';
//                   }}
//                 />
//                 <div className="flex-1">
//                   <h4 className="font-medium text-sm line-clamp-2">
//                     {video.description}
//                   </h4>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {watchedVideos.includes(video.id) && "✓ Watched • "}
//                     {video.duration || '5:30'}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
      
//     );
// };

// export default VideoDetailsPage;



import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  increment, 
  query, 
  where,
  orderBy,
  limit
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ReactPlayer from 'react-player';

const VideoDetailsPage = () => {
    const { courseName, videoId } = useParams();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [activeVideo, setActiveVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [ads, setAds] = useState([]);
    const [likes, setLikes] = useState(0);
    const [userLiked, setUserLiked] = useState(false);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [watchedVideos, setWatchedVideos] = useState([]);
    const [orderedVideos, setOrderedVideos] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                const userSubRef = doc(db, "subscriptions", user.email);
                getDoc(userSubRef).then((docSnap) => {
                    if (docSnap.exists()) {
                        const courseData = docSnap.data().DETAILS.find(d => Object.keys(d)[0] === courseName);
                        if (courseData) {
                            setWatchedVideos(courseData[courseName].watchedVideos || []);
                        }
                    }
                });
            }
        });
        return () => unsubscribe();
    }, [courseName]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch active video details
                const videoRef = doc(db, `videos_${courseName}`, videoId);
                const videoSnap = await getDoc(videoRef);

                if (videoSnap.exists()) {
                    const videoData = videoSnap.data();
                    setActiveVideo({ id: videoSnap.id, ...videoData });
                    setLikes(videoData.likes || 0);
                }

                // Fetch ordered course videos
                const videosQuery = query(
                    collection(db, `videos_${courseName}`),
                    orderBy("order", "asc"),
                    limit(10)
                );
                const videosSnapshot = await getDocs(videosQuery);
                const ordered = videosSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    thumbnail: doc.data().thumbnail || `https://img.youtube.com/vi/${extractYTId(doc.data().url)}/hqdefault.jpg`,
                    order: doc.data().order || 0
                }));
                setOrderedVideos(ordered);

                // Fetch ads
                const adsRef = collection(db, "ads");
                const adsSnapshot = await getDocs(adsRef);
                setAds(adsSnapshot.docs.map(doc => doc.data()));

                // Fetch comments
                const commentsQuery = query(
                    collection(db, "Comments_Vahaly_Astro"),
                    where("courseName", "==", courseName),
                    where("videoId", "==", videoId)
                );

                const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
                    const fetchedComments = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setComments(fetchedComments.sort((a, b) => b.timestamp - a.timestamp));
                });

                setLoading(false);
                return () => unsubscribeComments();
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [courseName, videoId]);

    const extractYTId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const markVideoAsWatched = async () => {
        if (!user) return;

        try {
            const userSubRef = doc(db, "subscriptions", user.email);
            const docSnap = await getDoc(userSubRef);

            if (docSnap.exists()) {
                const subscriptions = docSnap.data().DETAILS;
                const courseIndex = subscriptions.findIndex(d => Object.keys(d)[0] === courseName);

                if (courseIndex !== -1) {
                    const updatedSubs = [...subscriptions];
                    const watched = new Set(updatedSubs[courseIndex][courseName].watchedVideos || []);
                    watched.add(videoId);

                    updatedSubs[courseIndex][courseName].watchedVideos = Array.from(watched);

                    await updateDoc(userSubRef, {
                        DETAILS: updatedSubs
                    });
                    setWatchedVideos(Array.from(watched));
                }
            }
        } catch (err) {
            console.error("Error marking video as watched:", err);
        }
    };

    const handleVideoSelect = (video) => {
        navigate(`/course/${courseName}/video/${video.id}`);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        try {
            await addDoc(collection(db, "Comments_Vahaly_Astro"), {
                courseName,
                videoId,
                comment: newComment.trim(),
                userName: user.displayName || "Anonymous",
                userId: user.uid,
                timestamp: serverTimestamp(),
            });
            setNewComment("");
        } catch (err) {
            console.error("Error submitting comment:", err);
        }
    };

    const handleLike = async () => {
        if (!user || userLiked) return;

        try {
            const videoRef = doc(db, `videos_${courseName}`, videoId);
            await updateDoc(videoRef, {
                likes: increment(1)
            });
            setUserLiked(true);
            setLikes(prev => prev + 1);
        } catch (err) {
            console.error("Error updating likes:", err);
        }
    };

    const filteredVideos = videos.filter(video =>
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <div className="w-full md:w-3/4 p-6">
                <div className="bg-black rounded-xl overflow-hidden shadow-xl">
                    {activeVideo?.url ? (
                        <ReactPlayer
                            url={activeVideo.url}
                            controls
                            width="100%"
                            height="100%"
                            onEnded={markVideoAsWatched}
                            config={{
                                file: {
                                    attributes: {
                                        controlsList: "nodownload"
                                    }
                                }
                            }}
                        />
                    ) : (
                        <div className="h-96 bg-gray-800 flex items-center justify-center">
                            <p className="text-white">Video unavailable</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 bg-white p-6 rounded-xl shadow">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {activeVideo?.description || "Untitled Video"}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center px-4 py-2 rounded-full ${
                                userLiked ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                            } hover:bg-red-50 transition-colors`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {likes.toLocaleString()}
                        </button>
                        <span className="text-sm text-gray-500">
                            {watchedVideos.includes(videoId) ? "✓ Watched" : ""}
                        </span>
                    </div>
                </div>

                <div className="mt-6 bg-white p-6 rounded-xl shadow">
                    <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
                    {user && (
                        <form onSubmit={handleCommentSubmit} className="mb-6 flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a public comment..."
                                    className="w-full p-3 border-b-2 border-gray-200 focus:outline-none focus:border-red-500"
                                />
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                    >
                                        Comment
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4 items-start">
                                <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                                    <span className="font-medium">
                                        {comment.userName[0]?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{comment.userName}</h3>
                                        <span className="text-gray-500 text-sm">
                                            {new Date(comment.timestamp?.toDate()).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-800">{comment.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full md:w-1/4 p-4 bg-white border-l md:sticky md:top-0">
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search in course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                {ads.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">Sponsored</h3>
                        {ads.map((ad, index) => (
                            <a
                                key={index}
                                href={ad.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mb-4 group"
                            >
                                <div className="rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                                    <img
                                        src={ad.imageUrl}
                                        alt="Ad"
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="p-2">
                                        <p className="text-sm font-medium text-gray-700 group-hover:text-red-600">
                                            {ad.title}
                                        </p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                <h3 className="text-lg font-semibold mb-4">Up Next</h3>
                <div className="space-y-4">
                    {orderedVideos.map((video) => (
                        <div
                            key={video.id}
                            onClick={() => handleVideoSelect(video)}
                            className={`flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg ${
                                watchedVideos.includes(video.id) ? "bg-green-50" : ""
                            } ${video.id === videoId ? "bg-blue-50" : ""}`}
                        >
                            <div className="flex items-center justify-center w-8 text-sm text-gray-500">
                                {video.order + 1}
                            </div>
                            <img
                                src={video.thumbnail}
                                alt="Thumbnail"
                                className="w-24 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/120x68';
                                }}
                            />
                            <div className="flex-1">
                                <h4 className="font-medium text-sm line-clamp-2">
                                    {video.description}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    {watchedVideos.includes(video.id) && "✓ Watched • "}
                                    {video.duration || '5:30'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoDetailsPage;