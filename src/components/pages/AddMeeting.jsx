// src/components/ScheduleMeeting.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust this path based on your Firebase config
import Admin from './Admin';
import Draggable from 'react-draggable';

const ScheduleMeeting = () => {
  // State for meeting fields
  const [subject, setSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [meetings, setMeetings] = useState([]);
  const [iframeUrl, setIframeUrl] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // State for courses fetched from Firebase
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Fetch courses (free & paid) from Firebase on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch all paid courses
        const paidSnapshot = await getDocs(collection(db, 'paidCourses'));
        // Fetch all free courses
        const freeSnapshot = await getDocs(collection(db, 'freeCourses'));

        const coursesData = [];

        // Push all paid courses into coursesData
        paidSnapshot.forEach((doc) => {
          coursesData.push({
            id: doc.id,
            ...doc.data(),
            type: 'paid', // Mark them as paid if not already in doc
          });
        });

        // Push all free courses into coursesData
        freeSnapshot.forEach((doc) => {
          coursesData.push({
            id: doc.id,
            ...doc.data(),
            type: 'free', // Mark them as free if not already in doc
          });
        });

        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const fetchMeetings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "meetings"));
      const meetings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Meetings:", meetings);
      setMeetings(meetings); // optional: save to state
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [])

  // Call this on link click
  const handleOpenPopup = (url) => {
    setIframeUrl(url);
    setShowIframe(true);
    setIsFullscreen(false);

    // Save to localStorage
    localStorage.setItem('liveMeeting', JSON.stringify({
      url,
      isFullscreen: false,
    }));
  };


  // Close iframe popup
  const handleClosePopup = () => {
    setShowIframe(false);
    setIframeUrl('');
    setIsFullscreen(false);

    // Remove from localStorage
    localStorage.removeItem('liveMeeting');
  };

  useEffect(() => {
    const saved = localStorage.getItem('liveMeeting');
    if (saved) {
      const { url, isFullscreen } = JSON.parse(saved);
      setIframeUrl(url);
      setShowIframe(true);
      setIsFullscreen(isFullscreen || false);
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1) Schedule the meeting
      const response = await axios.post('http://localhost:5000/api/create-room', {
        courseId: selectedCourse,
        subject,
        startTime: startDate,  // Backend still expects startTime
        duration,
      });

      console.log('Meeting scheduled:', response.data.meeting);

      // 2) Save to Firestore
      await addDoc(collection(db, 'meetings'), {
        courseId: selectedCourse,
        subject,
        startDate, // Save new key
        duration,
        ringCentralMeeting: response.data.meeting,
        createdAt: serverTimestamp(),
      });

      // 3) Reset form / show success
      setSubject('');
      setStartDate('');
      setDuration(30);
      setSelectedCourse('');
      alert('Meeting scheduled and saved to Firestore!');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. See console for details.');
    }
  };



  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-1/6 bg-white shadow-md p-4">
        <Admin />
      </aside>

      {/* Main content wrapper */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Schedule Form */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
            📅 Schedule RingCentral Meeting
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Dropdown */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Select Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} {course.type ? `(${course.type})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Title */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Meeting Title</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter meeting title"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Date and Time */}
            {/* Meeting Date */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Meeting Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>


            {/* Duration */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition"
            >
              Schedule Meeting
            </button>
          </form>
        </div>

        {/* Meeting List */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Scheduled Meetings</h2>

          {meetings.length === 0 ? (
            <p className="text-gray-500">No meetings scheduled yet.</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="border rounded-lg p-4 shadow hover:shadow-md transition bg-white"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-red-600">{meeting.subject}</h3>
                    <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      {meeting.duration} mins
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    🕒 <strong>Start:</strong>{' '}
                    {new Date(meeting.startTime).toLocaleString()}
                  </p>
                  {meeting.ringCentralMeeting?.roomUrl && (
                    <button
                      onClick={() => handleOpenPopup(meeting.ringCentralMeeting.roomUrl)}
                      className="mt-3 inline-block text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition"
                    >
                      Join Meeting
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Draggable Iframe Popup */}
        {showIframe && (
          <div className="fixed top-0 left-0 z-50 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <Draggable handle=".drag-header">
                <div
                  className={`pointer-events-auto flex flex-col bg-white shadow-lg rounded-md overflow-hidden transition-all duration-300 ${isFullscreen
                      ? 'w-screen h-screen'
                      : 'w-[95vw] h-[80vh] md:w-[700px] md:h-[500px]'
                    }`}
                >
                  {/* Header */}
                  <div className="drag-header bg-red-600 text-white flex justify-between items-center px-4 py-2 cursor-move">
                    <span className="font-bold">🔴 Live Meeting</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="bg-white text-red-600 px-3 py-1 rounded text-sm font-semibold"
                      >
                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      </button>
                      <button
                        onClick={handleClosePopup}
                        className="bg-white text-red-600 px-3 py-1 rounded text-sm font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Iframe */}
                  <iframe
                    src={iframeUrl}
                    title="Meeting"
                    className="w-full flex-grow"
                    allow="camera; microphone; fullscreen"
                  ></iframe>
                </div>
              </Draggable>
            </div>
          </div>
        )}

      </main>
    </div>

  );
};

export default ScheduleMeeting;
