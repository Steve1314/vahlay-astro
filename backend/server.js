

// import Razorpay from "razorpay";
// import express from "express";
// import cors from "cors";
// import nodemailer from "nodemailer";

// const app = express();
// app.use(express.json());
// app.use(cors());
// PORT=process.env.PORT || 5000
// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: "rzp_test_LVtLqrRZG9jP33", // Replace with your Razorpay Key ID
//   key_secret: "GlkhgrCs6FwbBTcmEsDS8LgO", // Replace with your Razorpay Key Secret
// });

// // Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "ramahir9444@gmail.com", // Replace with your email
//     pass: "hrsb xbfy cmxx pokr", // Replace with app-specific password
//   },
// });

// // API to create Razorpay order
// app.post("/create-order", async (req, res) => {
//   const { amount, email, name, phone } = req.body;

//   if (!amount || isNaN(amount) || !email || !name || !phone) {
//     return res.status(400).json({ error: "Invalid input" });
//   }

//   const options = {
//     amount: amount * 100, // Convert to paise
//     currency: "INR",
//     receipt: `receipt_${Date.now()}`,
//   };

//   try {
//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // API to handle payment success webhook
// app.post("/payment-success", async (req, res) => {
//   const { email, name, phone, course, paymentDetails } = req.body;

//   if (!email || !name || !phone || !course || !paymentDetails) {
//     return res.status(400).json({ error: "Invalid input" });
//   }

//   try {
//     const mailOptions = {
//       from: "ramahir9444@gmail.com",
//       to: email,
//       subject: "Payment Successful - Enrollment Confirmation",
//       html: `
//         <h1>Thank You for Your Payment!</h1>
//         <p>Hi ${name},</p>
//         <p>We have received your payment for the course <strong>${course}</strong>.</p>
//         <p><strong>Transaction Details:</strong></p>
//         <ul>
//           <li>Payment ID: ${paymentDetails.razorpay_payment_id}</li>
//           <li>Order ID: ${paymentDetails.razorpay_order_id}</li>
//           <li>Amount: ₹${paymentDetails.amount / 100}</li>
//         </ul>
//         <p>We look forward to having you in the course!</p>
//         <p>Best Regards,<br>Astrology Team</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Success email sent.");
//     res.status(200).json({ message: "Payment processed and email sent." });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ error: "Failed to send email." });
//   }
// });

// // API for payment failure notification
// app.post("/payment-failed", async (req, res) => {
//   const { email, name } = req.body;

//   if (!email || !name) {
//     return res.status(400).json({ error: "Invalid input" });
//   }

//   try {
//     const mailOptions = {
//       from: "ramahir9444@gmail.com",
//       to: email,
//       subject: "Payment Unsuccessful",
//       html: `
//         <h1>Payment Failed</h1>
//         <p>Hi ${name},</p>
//         <p>Unfortunately, your payment did not go through. Please try again or contact support if the issue persists.</p>
//         <p>Best Regards,<br>Astrology Team</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Failure email sent.");
//     res.status(200).json({ message: "Failure email sent." });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ error: "Failed to send email." });
//   }
// });

// app.listen(PORT, () => {
//   console.log("Server running on port 5000");
// });







// import express from 'express';
// import cors from 'cors';
// import nodemailer from 'nodemailer';
// import Razorpay from 'razorpay';

// const app = express();
// app.use(express.json());

// require("dotenv").config();


// // Allowed origins for CORS
// const allowedOrigins = ["http://localhost:5173", "https://vahlayastro.com"];

// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true, // Allow cookies or auth headers
//   })
// );

// // Hardcoded Razorpay API keys
// const razorpay = new Razorpay({
//   key_id: 'rzp_test_LVtLqrRZG9jP33',    // Hardcoded Razorpay key
//   key_secret: 'GlkhgrCs6FwbBTcmEsDS8LgO', // Hardcoded Razorpay secret key
// });

// // Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: 'ramahir9444@gmail.com', // Hardcoded email user
//     pass: 'hrsb xbfy cmxx pokr',   // Hardcoded email app-specific password
//   },
// });

// // API to create Razorpay order
// app.post("/create-order", async (req, res) => {
//   const { amount, email, name, phone } = req.body;

//   if (!amount || isNaN(amount) || !email || !name || !phone) {
//     return res.status(400).json({ error: "Invalid input" });
//   }

//   const options = {
//     amount: amount * 100, // Convert to paise
//     currency: "INR",
//     receipt: `receipt_${Date.now()}`,
//   };

//   try {
//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // API to handle payment success webhook
// app.post("/payment-success", async (req, res) => {
//   const { email, name, phone, course, paymentDetails } = req.body;

//   if (!email || !name || !phone || !course || !paymentDetails) {
//     return res.status(400).json({ error: "Invalid input" });
//   }

//   try {
//     const mailOptions = {
//       from: 'ramahir9444@gmail.com', // Hardcoded email user
//       to: email,
//       subject: "Payment Successful - Enrollment Confirmation",
//       html: `
//         <h1>Thank You for Your Payment!</h1>
//         <p>Hi ${name},</p>
//         <p>We have received your payment for the course <strong>${course}</strong>.</p>
//         <p><strong>Transaction Details:</strong></p>
//         <ul>
//           <li>Payment ID: ${paymentDetails.razorpay_payment_id}</li>
//           <li>Order ID: ${paymentDetails.razorpay_order_id}</li>
//           <li>Amount: ₹${paymentDetails.amount / 100}</li>
//         </ul>
//         <p>We look forward to having you in the course!</p>
//         <p>Best Regards,<br>Astrology Team</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Success email sent.");
//     res.status(200).json({ message: "Payment processed and email sent." });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ error: "Failed to send email." });
//   }
// });

// // API for payment failure notification
// app.post("/payment-failed", async (req, res) => {
//   const { email, name } = req.body;

//   if (!email || !name) {
//     return res.status(400).json({ error: "Invalid input" });
//   }

//   try {
//     const mailOptions = {
//       from: 'ramahir9444@gmail.com', // Hardcoded email user
//       to: email,
//       subject: "Payment Unsuccessful",
//       html: `
//         <h1>Payment Failed</h1>
//         <p>Hi ${name},</p>
//         <p>Unfortunately, your payment did not go through. Please try again or contact support if the issue persists.</p>
//         <p>Best Regards,<br>Astrology Team</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Failure email sent.");
//     res.status(200).json({ message: "Failure email sent." });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ error: "Failed to send email." });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



// import express from "express";
// import cors from "cors";
// import nodemailer from "nodemailer";
// import Razorpay from "razorpay";
// import dotenv from "dotenv";

// dotenv.config(); // Load .env variables

// const app = express();
// app.use(express.json());

// // Allowed origins for CORS
// const allowedOrigins = ["http://localhost:5173", "https://vahlayastro.com"];

// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true, // Allow cookies or auth headers
//   })
// );

// // Razorpay instance with environment variables
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID, // From .env
//   key_secret: process.env.RAZORPAY_SECRET, // From .env
// });

// // Nodemailer transporter with environment variables
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER, // From .env
//     pass: process.env.EMAIL_PASS, // From .env
//   },
// });

// // API to create Razorpay order
// app.post("/create-order", async (req, res) => {
//   const { amount, email, name, phone } = req.body;

//   if (!amount || isNaN(amount) || !email || !name || !phone) {
//     return res.status(400).json({ error: "Invalid input" });
//   }

//   const options = {
//     amount: amount * 100, // Convert to paise
//     currency: "INR",
//     receipt: `receipt_${Date.now()}`,
//   };

//   try {
//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // API to handle payment success
// app.post("/payment-success", async (req, res) => {
//   const { email, name, phone, course, paymentDetails } = req.body;

//   if (!email || !name || !phone || !course || !paymentDetails) {
//     return res.status(400).json({ error: "Invalid input" });
//   }

//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER, // From .env
//       to: email,
//       subject: "Payment Successful - Enrollment Confirmation",
//       html: `
//         <h1>Thank You for Your Payment!</h1>
//         <p>Hi ${name},</p>
//         <p>We have received your payment for the course <strong>${course}</strong>.</p>
//         <p><strong>Transaction Details:</strong></p>
//         <ul>
//           <li>Payment ID: ${paymentDetails.razorpay_payment_id}</li>
//           <li>Order ID: ${paymentDetails.razorpay_order_id}</li>
//           <li>Amount: ₹${paymentDetails.amount / 100}</li>
//         </ul>
//         <p>We look forward to having you in the course!</p>
//         <p>Best Regards,<br>Astrology Team</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Success email sent.");
//     res.status(200).json({ message: "Payment processed and email sent." });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ error: "Failed to send email." });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



// import express from "express";
// import cors from "cors";
// import Razorpay from "razorpay";
// import dotenv from "dotenv";

// dotenv.config(); // Load .env variables

// const app = express();

// // Dynamic CORS configuration
// const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//   })
// );

// app.use(express.json());

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
//   key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay Key Secret
// });

// app.post("/create-razorpay-order", async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (!amount) {
//       return res.status(400).json({ error: "Amount is required" });
//     }

//     const order = await razorpay.orders.create({
//       amount: amount * 100, // Convert to paise
//       currency: "INR",
//     });

//     res.status(200).json({ orderId: order.id });
//   } catch (error) {
//     console.error("Error creating Razorpay order:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Dynamic CORS configuration
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://vahlayastro.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

// Razorpay instance configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
    });

    res.status(200).json({ orderId: order.id });
  } catch (error) {
    console.error("Error creating Razorpay order:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.use((req, res) => {
  res.status(404).send("Endpoint not found.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
