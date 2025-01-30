/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });




const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

exports.verifyRecaptcha = functions.https.onRequest(async (req, res) => {
  const recaptchaResponse = req.body.recaptchaResponse;
  const secretKey = 'EOw2SoQtNQ8uqu6ZnH2GaQxxpCSY6LMlaIw0H0zvNXCxEZ3SoJYKqLoDCn5R4AHzUXaFbYonyU9q-u2O'; // Your reCAPTCHA secret key

  try {
    const googleResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`
    );
    const googleData = googleResponse.data;

    if (googleData.success) {
      // reCAPTCHA was successful, proceed with your Firebase logic
      res.status(200).send('reCAPTCHA verified successfully');
    } else {
      res.status(400).send('reCAPTCHA verification failed');
    }
  } catch (error) {
    res.status(500).send('Error verifying reCAPTCHA');
  }
});
