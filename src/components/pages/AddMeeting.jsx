import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Admin from './Admin';
import '@whereby.com/browser-sdk/embed';
import Draggable from 'react-draggable';

const ScheduleMeeting = () => {
  const [subject, setSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [meetings, setMeetings] = useState([]);
  const [iframeUrl, setIframeUrl] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const paid = await getDocs(collection(db, 'paidCourses'));
        const free = await getDocs(collection(db, 'freeCourses'));
        const list = [];
        paid.forEach(d => list.push({ id: d.id, ...d.data(), type: 'paid' }));
        free.forEach(d => list.push({ id: d.id, ...d.data(), type: 'free' }));
        setCourses(list);
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    fetchCourses();
  }, []);
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const snap = await getDocs(collection(db, 'meetings'));
        setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching meetings:', err);
      }
    };
    fetchMeetings();

    const saved = localStorage.getItem('liveMeeting');
    if (saved) {
      const { url, isFullscreen: fs } = JSON.parse(saved);
      setIframeUrl(url);
      setShowIframe(true);
      setIsFullscreen(fs);
    }
  }, []);
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
  const handleDeleteMeeting = async (meetingId) => {
    try {
      // if using Firestore:
      await deleteDoc(doc(db, "meetings", meetingId));

      // optionally update local state:
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));

      alert("Meeting deleted successfully");
    } catch (error) {
      console.error("Error deleting meeting:", error);
      alert("Failed to delete meeting");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Basic field validation
    if (!selectedCourse || !subject.trim() || !startDate || !duration) {
      return alert('Please fill all fields.');
    }

    const durationNum = Number(duration);

    // 2. Start date must be today or in the future
    const selectedDate = new Date(startDate);
    const now = new Date();
    if (selectedDate < new Date(now.setHours(0, 0, 0, 0))) {
      return alert('Start date must be today or in the future.');
    }

    // 3. Duration must be a positive number
    if (isNaN(durationNum) || durationNum <= 0) {
      return alert('Duration must be a positive number.');
    }

    // 4. Check time overlap for same course
    const newStart = new Date(startDate).getTime();
    const newEnd = newStart + durationNum * 60 * 1000;

    const isConflict = meetings.some((m) => {
      if (m.courseId !== selectedCourse) return false;

      const existingStart = new Date(m.startDate).getTime();
      const existingEnd = existingStart + Number(m.duration) * 60 * 1000;

      // Overlap condition
      return newStart < existingEnd && existingStart < newEnd;
    });

    if (isConflict) {
      return alert('A meeting already exists with this timeduration for this course.');
    }

    // 5. Proceed to create meeting
    try {
      const response = await axios.post('https://cloudastro.space/api/create-room', {
        startDate,
      });

      const meeting = response.data.meeting;

      await addDoc(collection(db, 'meetings'), {
        courseId: selectedCourse,
        subject: subject.trim(),
        startDate,
        duration: durationNum,
        ringCentralMeeting: meeting,
        createdAt: serverTimestamp(),
      });

      alert('Meeting scheduled!');
      setSubject('');
      setStartDate('');
      setDuration(30);
      setSelectedCourse('');

      // Refresh meetings list
      const snap = await getDocs(collection(db, 'meetings'));
      setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      alert('Failed to schedule meeting.');
    }
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <aside className="w-full md:w-1/6 bg-white shadow-md">
        <Admin />
      </aside>
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
            📅 Schedule RingCentral Meeting
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Course</label>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" required>
                <option value="">Select a course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Title</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full border p-2 rounded-md" required />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Date</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border p-2 rounded-md" required />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Duration (mins)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full border p-2 rounded-md" required />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition">Schedule Meeting</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Scheduled Meetings</h2>
          {meetings.length === 0 ? (
            <p className="text-gray-500">No meetings yet.</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {meetings.map(m => (
                <div key={m.id} className="border p-4 rounded-lg shadow hover:shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-red-600">{m.subject}</h3>

                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">{m.duration} mins</span>

                  </div>
                  <h3 className="text-lg font-semibold text-gray-600">{m.courseId}</h3>

                  <p className="text-sm text-gray-600"><p className="text-sm text-gray-600">
                    🕒 {new Date(m.startDate).toLocaleString()}
                  </p>
                  </p>
                  {m.ringCentralMeeting?.roomUrl && (
                    <>
                      <button
                        onClick={() => window.open(m.ringCentralMeeting.roomUrl, '_blank')}
                        className="text-blue-600 underline mr-2"
                      >
                        Join
                      </button>

                      <button
                        onClick={() => navigator.clipboard.writeText(m.ringCentralMeeting.roomUrl)}
                        className="text-blue-600 underline mr-2"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(m.id)}
                        className="text-red-600 underline"
                      >
                        Delete
                      </button>
                    </>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

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



      </main>
    </div>
  );
};

export default ScheduleMeeting;
