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
            setMeetingLink(meetingURL);
            setWaitingApproval(true); // 🔹 Show waiting message

            
            // Store meeting in Firestore with timestamp
            const docRef = await addDoc(collection(db, "meetings"), {
                link: meetingURL,
                createdAt: new Date()
            });

            console.log("Meeting saved:", docRef.id);
            fetchMeetings();
        } catch (error) {
            console.error("Error creating meeting:", error);
            alert("Failed to create meeting.");
        }
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
                                    <a href={meeting.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{meeting.link}</a>
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
