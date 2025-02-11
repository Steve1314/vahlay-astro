import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig"; 
import { query, collection, orderBy, limit, getDocs } from "firebase/firestore";

const LatestMeeting = () => {
    const [latestMeeting, setLatestMeeting] = useState(null);

    useEffect(() => {
        const fetchLatestMeeting = async () => {
            try {
                // Query Firestore for the most recent meeting
                const q = query(collection(db, "meetings"), orderBy("createdAt", "desc"), limit(1));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const latest = querySnapshot.docs[0].data().link;
                    setLatestMeeting(latest);
                } else {
                    console.log("No active meetings found.");
                    setLatestMeeting(null);
                }
            } catch (error) {
                console.error("Error fetching latest meeting:", error);
            }
        };

        fetchLatestMeeting();
    }, []);

    return (
        <div className="bg-red-500 p-2 rounded-lg shadow-md text-white w-full  ">
            <h3 className="text-xl font-semibold mb-2">Join Today's Meeting</h3>
            {latestMeeting ? (
                <p className="text-lg">
                    🔗 <a href={latestMeeting} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {latestMeeting}
                    </a>
                </p>
            ) : (
                <p className="text-gray-400">No active meetings available.</p>
            )}
        </div>
    );
};

export default LatestMeeting;
