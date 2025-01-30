
import React, { useState } from "react";
import axios from "axios";

const CreateLiveSession = () => {
  const [sessionData, setSessionData] = useState({
    title: "",
    roomName: "",
    date: "",
    time: "",
  });
  const [meetings, setMeetings] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSessionData({ ...sessionData, [name]: value });
  };

  const createZoomMeeting = async () => {
    const { title, roomName, date, time } = sessionData;

    if (!title || !roomName || !date || !time) {
      alert("Please fill in all fields");
      return;
    }

    const meetingData = {
      topic: title,
      type: 2,
      start_time: `${date}T${time}:00Z`, // ISO format
      duration: 60, // in minutes
      timezone: "UTC",
    };

    try {
      const response = await axios.post("https://api.zoom.us/v2/users/me/meetings", meetingData, {
        headers: {
          "Authorization": `Bearer YOUR_ZOOM_JWT_TOKEN`,
          "Content-Type": "application/json",
        },
      });

      const newMeeting = {
        id: response.data.id,
        join_url: response.data.join_url,
        host_url: response.data.start_url,
      };

      setMeetings((prev) => [...prev, newMeeting]);
      setSessionData({ title: "", roomName: "", date: "", time: "" });
      alert("Meeting created successfully!");
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  const deleteMeeting = (id) => {
    setMeetings(meetings.filter((meeting) => meeting.id !== id));
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-5 border rounded-lg shadow-lg">
      <h1 className="text-xl font-bold mb-4 text-center">Create Live Session</h1>
      <select
        className="w-full p-2 mb-4 border rounded"
        name="roomName"
        value={sessionData.roomName}
        onChange={handleInputChange}
      >
        <option value="">Select Room</option>
        <option value="Basics">Basics (Free)</option>
        <option value="Advanced">Advanced (Paid)</option>
      </select>
      <input
        type="text"
        name="title"
        placeholder="Session Title"
        className="w-full p-2 mb-4 border rounded"
        value={sessionData.title}
        onChange={handleInputChange}
      />
      <input
        type="date"
        name="date"
        className="w-full p-2 mb-4 border rounded"
        value={sessionData.date}
        onChange={handleInputChange}
      />
      <input
        type="time"
        name="time"
        className="w-full p-2 mb-4 border rounded"
        value={sessionData.time}
        onChange={handleInputChange}
      />
      <button
        onClick={createZoomMeeting}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Create Session
      </button>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Scheduled Meetings</h2>
        <ul>
          {meetings.map((meeting) => (
            <li key={meeting.id} className="mt-4 p-3 border rounded">
              <p className="font-medium">{meeting.topic}</p>
              <a
                href={meeting.join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Join as Host
              </a>
              <button
                onClick={() => deleteMeeting(meeting.id)}
                className="ml-4 text-red-500 underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CreateLiveSession;
