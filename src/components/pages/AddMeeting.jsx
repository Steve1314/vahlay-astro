import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !subject || !startDate) {
      return alert('Please fill all fields.');
    }
    try {
      const response = await axios.post('https://cloudastro.space/api/create-room', {
        startDate,
      });
      console.log(response)
      const meeting = response.data.meeting;
      await addDoc(collection(db, 'meetings'), {
        courseId: selectedCourse,
        subject,
        startDate,
        duration,
        ringCentralMeeting: meeting,
        createdAt: serverTimestamp(),
      });
      console.log(meeting);
      setSubject('');
      setStartDate('');
      setDuration(30);
      setSelectedCourse('');
      alert('Meeting scheduled!');
      const snap = await getDocs(collection(db, 'meetings'));
      setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      alert('Failed to schedule meeting.');
    }
  };
console.log(meetings)
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
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border p-2 rounded-md" required />
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
                  <p className="text-sm text-gray-600">🕒 {new Date(m.startDate).toLocaleDateString()}</p>
                  {m.ringCentralMeeting?.roomUrl && (
                    <button onClick={() => handleOpenPopup(m.ringCentralMeeting.roomUrl)} className="text-blue-600 underline">
                      Join
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showIframe && (
          <div
            className={`z-50 ${isFullscreen ? 'fixed top-0 left-0 w-screen h-screen' : 'fixed inset-0'} pointer-events-auto`}
            style={{ overflow: 'hidden' }}
          >
            <div className="relative w-full h-full">
              {isFullscreen ? (
                // Fullscreen mode — NO dragging, fill entire screen
                <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-lg flex flex-col">
                  <div className="flex justify-between items-center p-2 bg-red-600 text-white select-none">
                    <span className="font-bold">🔴 Live Meeting</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => setIsFullscreen(false)}
                        className="bg-white text-red-600 px-3 py-1 rounded text-sm"
                      >
                        Exit Fullscreen
                      </button>
                      <button
                        onClick={handleClosePopup}
                        className="bg-white text-red-600 px-3 py-1 rounded text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <whereby-embed
                    room={iframeUrl}
                    class="w-full flex-grow"
                    allow="camera; microphone; fullscreen; speaker; display-capture"
                  ></whereby-embed>
                </div>
              ) : (
                // Draggable mode (non-fullscreen)
                <Draggable handle=".drag-header" bounds="parent">
                  <div className="absolute top-20 left-20 w-[90vw] md:w-[700px] h-[500px] bg-white rounded-lg overflow-hidden shadow-lg flex flex-col">
                    <div className="drag-header flex justify-between items-center p-2 bg-red-600 text-white cursor-move select-none">
                      <span className="font-bold">🔴 Live Meeting</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => setIsFullscreen(true)}
                          className="bg-white text-red-600 px-3 py-1 rounded text-sm"
                        >
                          Fullscreen
                        </button>
                        <button
                          onClick={handleClosePopup}
                          className="bg-white text-red-600 px-3 py-1 rounded text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <whereby-embed
                      room={iframeUrl}
                      class="w-full flex-grow"
                      allow="camera; microphone; fullscreen; speaker; display-capture"
                    ></whereby-embed>
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
