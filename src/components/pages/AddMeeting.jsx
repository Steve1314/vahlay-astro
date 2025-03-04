// import React, { useState, useEffect, useRef } from "react";
// import { db } from "../../firebaseConfig";
// import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
// import gsap from "gsap";
// import Admin from "./Admin";

// const App = () => {
//     const [meetingLink, setMeetingLink] = useState(null);
//     const [meetings, setMeetings] = useState([]);
//     const containerRef = useRef(null);
//     const [waitingApproval, setWaitingApproval] = useState(false); // 🔹 NEW STATE


//     useEffect(() => {
//         gsap.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8 });
//         fetchMeetings();
//     }, []);

//     // Authenticate with Backend
//     const authenticate = async () => {
//         try {
//             const response = await fetch("http://localhost:5000/meeting/authenticate");
//             const data = await response.json();
//             alert(data.message);
//         } catch (error) {
//             console.error("Error authenticating:", error);
//             alert("Failed to authenticate.");
//         }
//     };

//     // Create a new meeting
//     const createMeeting = async () => {
//         try {
//             const response = await fetch("http://localhost:5000/meeting/create", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" }
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }

//             const data = await response.json();
//             const meetingURL = data.meetingLink;
//             setMeetingLink(meetingURL);
//             setWaitingApproval(true); // 🔹 Show waiting message


//             // Store meeting in Firestore with timestamp
//             const docRef = await addDoc(collection(db, "meetings"), {
//                 link: meetingURL,
//                 createdAt: new Date()
//             });

//             console.log("Meeting saved:", docRef.id);
//             fetchMeetings();
//         } catch (error) {
//             console.error("Error creating meeting:", error);
//             alert("Failed to create meeting.");
//         }
//     };

//     // Fetch meetings from Firestore
//     const fetchMeetings = async () => {
//         const querySnapshot = await getDocs(collection(db, "meetings"));
//         const meetingsData = querySnapshot.docs.map(doc => ({ id: doc.id, link: doc.data().link }));
//         setMeetings(meetingsData);
//     };

//     // Delete expired meetings
//     const deleteOldMeetings = async () => {
//         const now = new Date();
//         const oldMeetingsQuery = query(collection(db, "meetings"), where("createdAt", "<", new Date(now.getTime() - 24 * 60 * 60 * 1000)));

//         const querySnapshot = await getDocs(oldMeetingsQuery);
//         querySnapshot.forEach(async (doc) => {
//             await deleteDoc(doc.ref);
//             console.log("Deleted expired meeting:", doc.id);
//         });

//         fetchMeetings();
//     };

//     useEffect(() => {
//         deleteOldMeetings();
//     }, []);

//     return (
//       <div className="flex flex-col md:flex-row min-h-screen bg-white">
//       {/* Sidebar - Always visible on desktop and mobile */}
//       <div className="w-full md:w-1/4 bg-white shadow-md">
//         <Admin />
//       </div>

//             {/* Main Content */}
//             <main className="w-3/4 p-8" ref={containerRef}>
//                 <h1 className="text-4xl font-bold mb-6">RingCentral Video Meeting</h1>

//                 <button onClick={createMeeting} className="w-full bg-green-500 hover:bg-green-600 p-3 rounded">
//                     Create Meeting
//                 </button>

//                 {meetingLink && (
//                     <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg">
//                         <p className="text-lg">
//                             🔗 <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{meetingLink}</a>
//                         </p>

//                         {waitingApproval && (
//                             <p className="text-yellow-400 mt-2">⚠ Waiting for Admin Approval...</p> // 🔹 NEW MESSAGE
//                         )}

//                     </div>
//                 )}

//                 {/* List of Active Meetings */}
//                 <div className="mt-8">
//                     <h2 className="text-2xl font-semibold mb-4">Active Meetings</h2>
//                     {meetings.length > 0 ? (
//                         <ul className="bg-gray-800 p-4 rounded-lg">
//                             {meetings.map(meeting => (
//                                 <li key={meeting.id} className="border-b border-gray-700 py-2">
//                                     <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{meeting.link}</a>
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p className="text-gray-400">No active meetings found.</p>
//                     )}
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default App;








import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import gsap from "gsap";
import Admin from "./Admin";

const App = () => {
    const [meetingLink, setMeetingLink] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const containerRef = useRef(null);
    const [waitingApproval, setWaitingApproval] = useState(false); // 🔹 NEW STATE


    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8 });
        fetchMeetings();
    }, []);

    // Authenticate with Backend
    const authenticate = async () => {
        try {
            const response = await fetch("https://backend-7e8f.onrender.com/meeting/authenticate");
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error("Error authenticating:", error);
            alert("Failed to authenticate.");
        }
    };


    const checkHostStatus = async (meetingId) => {
        try {
            const response = await fetch(`https://backend-7e8f.onrender.com/meeting/status/${meetingId}`);
            const data = await response.json();

            if (data.isAssistantHost) {
                alert("✅ You are the host of this meeting!");
            } else {
                alert("⚠ You are a participant, not the host.");
            }
        } catch (error) {
            console.error("Error checking host status:", error);
        }
    };

    // Create a new meeting
    const createMeeting = async () => {
        try {
            const response = await fetch("https://backend-7e8f.onrender.com/meeting/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const meetingURL = data.meetingLink;
            const urlParts = meetingURL.split('/');
            const meetingId = urlParts[urlParts.length - 1]; // Extract Meeting ID

            setMeetingLink(meetingURL);
            setWaitingApproval(true);

            await addDoc(collection(db, "meetings"), {
                link: meetingURL,
                meetingId: meetingId, // Store meeting ID separately
                createdAt: new Date()
            });

            fetchMeetings();
        } catch (error) {
            console.error("Error creating meeting:", error);
            alert("Failed to create meeting.");
        }
    };



    const handleJoinMeeting = (meetingLink) => {
        const urlParts = meetingLink.split('/');
        const meetingId = urlParts[urlParts.length - 1]; // Extracts Meeting ID from URL
        console.log("joined")

        checkHostStatus(meetingId);
        window.open(meetingLink, "_blank");
    };



    // Fetch meetings from Firestore
    const fetchMeetings = async () => {
        const querySnapshot = await getDocs(collection(db, "meetings"));
        const meetingsData = querySnapshot.docs.map(doc => ({ id: doc.id, link: doc.data().link }));
        setMeetings(meetingsData);
    };

    // Delete expired meetings
    const deleteOldMeetings = async () => {
        const now = new Date();
        const oldMeetingsQuery = query(collection(db, "meetings"), where("createdAt", "<", new Date(now.getTime() - 24 * 60 * 60 * 1000)));

        const querySnapshot = await getDocs(oldMeetingsQuery);
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
            console.log("Deleted expired meeting:", doc.id);
        });

        fetchMeetings();
    };

    useEffect(() => {
        deleteOldMeetings();
    }, []);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white">
            {/* Sidebar - Always visible on desktop and mobile */}
            <div className="w-full md:w-1/4 bg-white shadow-md">
                <Admin />
            </div>

            {/* Main Content */}
            <main className="w-3/4 p-8" ref={containerRef}>
                <h1 className="text-4xl font-bold mb-6">RingCentral Video Meeting</h1>

                <button onClick={createMeeting} className="w-full bg-green-500 hover:bg-green-600 p-3 rounded">
                    Create Meeting
                </button>

                {meetingLink && (
                    <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg">
                        <p className="text-lg">
                            🔗 <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{meetingLink}</a>
                        </p>

                        {waitingApproval && (
                            <p className="text-yellow-400 mt-2">⚠ Waiting for Admin Approval...</p> // 🔹 NEW MESSAGE
                        )}

                    </div>
                )}

                {/* List of Active Meetings */}
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Active Meetings</h2>
                    {meetings.length > 0 ? (
                        <ul className="bg-gray-800 p-4 rounded-lg">
                            {meetings.map(meeting => (
                                <li key={meeting.id} className="border-b border-gray-700 py-2">
                                    <a href="#" onClick={() => handleJoinMeeting(meeting.link)} className="text-blue-400 hover:underline">
                                        {meeting.link}
                                    </a>
                                </li>
                            ))}

                        </ul>
                    ) : (
                        <p className="text-gray-400">No active meetings found.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;








// import React, { useState, useEffect, useCallback } from "react";
// import { db } from "../../firebaseConfig";
// import { collection, addDoc, getDocs, doc, updateDoc, query, where } from "firebase/firestore";

// const App = () => {
//     const [meetings, setMeetings] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const fetchMeetings = useCallback(async () => {
//         try {
//             const q = query(
//                 collection(db, "meetings"), 
//                 where("active", "==", true)
//             );
//             const snapshot = await getDocs(q);
//             const meetingsData = snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data(),
//                 createdAt: doc.data().createdAt.toDate()
//             }));
//             setMeetings(meetingsData);
//         } catch (err) {
//             setError("Failed to load meetings");
//         }
//     }, []);

//     useEffect(() => {
//         fetchMeetings();
//     }, [fetchMeetings]);

//     const createMeeting = async () => {
//         setLoading(true);
//         setError(null);
        
//         try {
//             const controller = new AbortController();
//             const timeoutId = setTimeout(() => controller.abort(), 45000);

//             const response = await fetch("http://localhost:5000/meeting/create", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 signal: controller.signal
//             });
            
//             clearTimeout(timeoutId);

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Meeting creation failed');
//             }

//             const data = await response.json();
            
//             await addDoc(collection(db, "meetings"), {
//                 link: data.meetingLink,
//                 meetingId: data.meetingId,
//                 createdAt: new Date(),
//                 active: true,
//                 expiration: data.expiration
//             });

//             await fetchMeetings();

//         } catch (err) {
//             setError(err.message || 'Failed to create meeting');
//             if (err.name === 'AbortError') {
//                 setError('Request timed out. Please try again.');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const endMeeting = async (meetingId) => {
//         try {
//             const response = await fetch(
//                 `http://localhost:5000/meeting/end/${meetingId}`,
//                 { method: "DELETE" }
//             );

//             if (!response.ok) {
//                 throw new Error('Failed to end meeting');
//             }

//             await updateDoc(doc(db, "meetings", meetingId), {
//                 active: false,
//                 endedAt: new Date()
//             });

//             await fetchMeetings();

//         } catch (err) {
//             setError(err.message || 'Failed to end meeting');
//         }
//     };

//     return (
//         <div className="container mx-auto p-4">
//             <div className="max-w-2xl mx-auto">
//                 <h1 className="text-2xl font-bold mb-6">Meeting Manager</h1>

//                 <button 
//                     onClick={createMeeting}
//                     disabled={loading}
//                     className={`w-full py-2 px-4 mb-6 rounded ${
//                         loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
//                     }`}
//                 >
//                     {loading ? 'Creating Meeting...' : 'Create New Meeting'}
//                 </button>

//                 {error && (
//                     <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
//                         Error: {error}
//                     </div>
//                 )}

//                 <div className="space-y-4">
//                     <h2 className="text-xl font-semibold mb-3">Active Meetings</h2>
                    
//                     {meetings.length === 0 ? (
//                         <p className="text-gray-600">No active meetings found</p>
//                     ) : (
//                         meetings.map(meeting => (
//                             <div key={meeting.id} className="p-4 border rounded-lg shadow-sm">
//                                 <div className="flex justify-between items-center">
//                                     <div>
//                                         <a
//                                             href={meeting.link}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="text-blue-600 hover:underline"
//                                         >
//                                             Join Meeting
//                                         </a>
//                                         <p className="text-sm text-gray-500 mt-1">
//                                             Created: {meeting.createdAt.toLocaleString()}
//                                         </p>
//                                     </div>
//                                     <button
//                                         onClick={() => endMeeting(meeting.meetingId)}
//                                         className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
//                                     >
//                                         End Meeting
//                                     </button>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default App;