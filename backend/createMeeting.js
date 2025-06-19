// backend/createMeeting.js
const { rc, authenticate } = require('./ringCentralService');

async function createMeeting(meetingDetails) {
  try {
    // Ensure authentication is done
    await authenticate();

    // Prepare the payload based on RingCentral API requirements.
    const payload = {
      subject: meetingDetails.subject,
      startTime: meetingDetails.startTime, // Format as required by the API
      durationInMinutes: meetingDetails.duration,
      // Add any additional parameters if needed
    };

    // Make the API call (adjust the endpoint per the latest documentation)
    const response = await rc.platform().post(
      '/restapi/v1.0/account/~/extension/~/meeting',
      payload
    );
    const meetingInfo = await response.json();
    return meetingInfo;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
}

module.exports = { createMeeting };
