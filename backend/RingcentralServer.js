// backend/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createMeeting } = require('./createMeeting');

const app = express();
app.use(bodyParser.json());

app.post('/api/schedule-meeting', async (req, res) => {
  try {
    const meetingDetails = req.body;
    const meetingInfo = await createMeeting(meetingDetails);

    // Here, add code to store meetingInfo in Firebase (using the Firebase Admin SDK)
    // For example:
    // await firebaseAdmin.firestore().collection('courses').doc(meetingDetails.courseId)
    //       .update({ meetingLink: meetingInfo.joinUrl, ... });

    res.json({ success: true, meeting: meetingInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
