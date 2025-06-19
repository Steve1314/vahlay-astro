import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Draggable from 'react-draggable';
import { useParams } from 'react-router-dom';
import Aside from '../pages/Aside'

const CourseMeetingPopup = () => {
    const { courseName } = useParams();
    const [meetings, setMeetings] = useState([]);
    const [iframeUrl, setIframeUrl] = useState('');
    const [showIframe, setShowIframe] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState("")

    useEffect(() => {
        const fetchMeetings = async () => {
            const meetingsRef = collection(db, 'meetings');
            const q = query(meetingsRef, where('courseId', '==', courseName));
            const querySnapshot = await getDocs(q);
            const meetingDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            meetingDocs.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            setMeetings(meetingDocs);
        };
        fetchMeetings();
    }, [courseName]);

    const handleOpenPopup = (url) => {
        setIframeUrl(url);
        setShowIframe(true);
        setIsFullscreen(false);
    };

    const handleClosePopup = () => {
        setShowIframe(false);
        setIframeUrl('');
        setIsFullscreen(false);
    };

    if(!meetings){
        return(
            <h1>Loadding....</h1>
        )
    }

    return (
        <div className=" flex">
             <Aside />
             <div className='p-8'>
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Meetings for Course: {courseName}</h2>

            {meetings.length === 0 ? (
                <p className="text-gray-500">No meetings scheduled.</p>
            ) : (
                <div className="space-y-4">
                    {meetings.map((m) => (
                        <div key={m.id} className="border p-4 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold">{m.subject}</h3>
                                <p className="text-sm text-gray-600">Date: {new Date(m.startDate).toLocaleString()}</p>
                            </div>
                            <div>
                                {m.ringCentralMeeting?.roomUrl && (
                                    <button
                                        onClick={() => handleOpenPopup(m.ringCentralMeeting.roomUrl)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                    >
                                        Join
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showIframe && (
                <div className={`z-50 ${isFullscreen ? 'fixed top-0 left-0 w-screen h-screen' : 'fixed inset-0'} pointer-events-auto`} style={{ overflow: 'hidden' }}>
                    <div className="relative w-full h-full">
                        {isFullscreen ? (
                            <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-lg flex flex-col">
                                <div className="flex justify-between items-center p-2 bg-red-600 text-white select-none">
                                    <span className="font-bold">🔴 Live Meeting</span>
                                    <div className="space-x-2">
                                        <button onClick={() => setIsFullscreen(false)} className="bg-white text-red-600 px-3 py-1 rounded text-sm">Exit Fullscreen</button>
                                        <button onClick={handleClosePopup} className="bg-white text-red-600 px-3 py-1 rounded text-sm">✕</button>
                                    </div>
                                </div>
                                <iframe
                                    src={iframeUrl}
                                    className="w-full flex-grow"
                                    allow="camera; microphone; fullscreen; speaker; display-capture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            <Draggable handle=".drag-header" bounds="parent">
                                <div className="absolute top-20 left-20 w-[90vw] md:w-[700px] h-[500px] bg-white rounded-lg overflow-hidden shadow-lg flex flex-col">
                                    <div className="drag-header flex justify-between items-center p-2 bg-red-600 text-white cursor-move select-none">
                                        <span className="font-bold">🔴 Live Meeting</span>
                                        <div className="space-x-2">
                                            <button onClick={() => setIsFullscreen(true)} className="bg-white text-red-600 px-3 py-1 rounded text-sm">Fullscreen</button>
                                            <button onClick={handleClosePopup} className="bg-white text-red-600 px-3 py-1 rounded text-sm">✕</button>
                                        </div>
                                    </div>
                                    <iframe
                                        src={iframeUrl}
                                        className="w-full flex-grow"
                                        allow="camera; microphone; fullscreen; speaker; display-capture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </Draggable>
                        )}
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default CourseMeetingPopup;
