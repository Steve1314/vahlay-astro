import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { doc, setDoc, updateDoc, arrayUnion, getDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from 'react-google-recaptcha';

const EnrollPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const navigate = useNavigate();

  const recaptchaSiteKey = import.meta.env. VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const freeCoursesCollection = collection(db, 'freeCourses');
        console.log(freeCoursesCollection)
        const freeCoursesSnapshot = await getDocs(freeCoursesCollection);
        const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses([...freeCourses]);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
   
  }, []);

  const handleRecaptchaChange = (value) => {
    setRecaptchaToken(value);
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !selectedCourse) {
      alert("Please fill out all fields.");
      return;
    }
    if (!recaptchaToken) {
      alert("Please verify the reCAPTCHA.");
      return;
    }
    const userRef = doc(db, "subscriptions", email);
    

    try {
      const docSnap = await getDoc(userRef);
     
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.freecourses && userData.freecourses.includes(selectedCourse)) {
          alert("You are already enrolled in this course.");
          navigate("/dashboard");
          return;
        }
        await updateDoc(userRef, {
          freecourses: arrayUnion(selectedCourse),
        });
      } else {
        await setDoc(userRef, {
          freecourses: [selectedCourse],
          name,
          email,
          phone,
        });
      }
      alert("You have successfully enrolled!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error processing your enrollment. Please try again.");
    }
  };

  return (
    <div className="bg-red-500 text-white p-4 rounded-lg max-w-lg mx-auto min-h-screen text-sm   m-6 ">
      <h2 className="text-xl md:text-4xl  font-semibold text-center mb-6">Enroll Now</h2>
      <p className="text-center mb-6">
        Join our <span className="font-bold text-white">Astrology</span> course and begin your journey into the world of astrology!
      </p>
      <form onSubmit={handleEnroll} className="space-y-6">
        <div className="flex flex-col">
          <label htmlFor="name" className="text-lg mb-2">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="px-4 py-2 rounded-lg bg-white text-red-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-lg mb-2">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="px-4 py-2 rounded-lg bg-white text-red-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="phone" className="text-lg mb-2">Phone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number with country code"
            className="px-4 py-2 rounded-lg bg-white text-red-500"
            required
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="course" className="text-lg mb-2">Course</label>
          <select
            id="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-red-500"
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.id}
              </option>
            ))}
          </select>
        </div>

        <ReCAPTCHA
          sitekey={recaptchaSiteKey}
          onChange={handleRecaptchaChange}
        />

        <button
          type="submit"
          className="w-full py-3 bg-white text-red-500 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition"
        >
          Enroll Now
        </button>
      </form>
    </div>
  );
};

export default EnrollPage;
