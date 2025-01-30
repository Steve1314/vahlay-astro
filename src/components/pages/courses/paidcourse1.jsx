import React from "react";
import { Link } from "react-router-dom";
const EnrollmentPage = () => {
  return (
    <div>
      {/* Hero Section */}
     
    <section className="bg-white " style={{
  backgroundImage: "url('/assets/Screenshot 2024-11-28 211019.png')"
}}>
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center">
        {/* Left Content */}

        
        
        <div className="space-y-4 md:w-2/3">
          {/* edX Logo and Title */}
          <div className="flex items-center space-x-2">
           
            <h1 className="text-3xl md:text-4xl font-bold text-red-900">
            Punchange and Foundation of astrology 
 
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <h6 className="text-yellow-500 font-semibold text-lg">★★★★★</h6>
            <br/>
          </div>
          <div>
            <p className="text-red-900">
              <span className="font-bold text-red-900">4.1 stars</span> | 67 ratings
            </p>
            </div>

          {/* Subtitle */}
          <p className="text-red-600 text-lg">
          It's Not Just A Course, It’s A Life-Changing Experience!
          </p>
        </div>

        {/* Right Content - Image */}
        <div className="mt-6 md:mt-0 md:w-1/3">
          <img
            src="/assets/enrolledpg.webp" // Replace with actual image path
            alt="Online Learning Illustration"
            className="rounded-lg shadow-md w-full"
          />
        </div>
      </div>
      </section>
      {/* Bottom Info Section */}
      <div className=" bg-red-600 relative flex">
  {/* Left Section: Ivory Background */}
  <div className=" w-3/4 py-6 relative ">
    <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
      {/* Info Item 1 */}
      <div className="flex items-center space-x-3">
        <div className="text-white">
          {/* Clock Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l3 3m6-6a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-lg">24 session</p>
          <p className="text-white text-sm">Q+A session Extra</p>
        </div>
      </div>

      {/* Info Item 2 */}
      <div className="flex items-center space-x-3 mt-4 md:mt-0">
        <div className="text-white">
          {/* User Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 18.75a8.25 8.25 0 0115 0"
            />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-lg">Self-paced</p>
          <p className="text-white text-sm">Progress at your own speed</p>
        </div>
      </div>

      {/* Info Item 3 */}
      <div className="flex items-center space-x-3 mt-4 md:mt-0">
        <div className="text-white">
          {/* Dollar Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-2.25 0-4 1.567-4 3.5S9.75 15 12 15m0 0c2.25 0 4-1.567 4-3.5S14.25 8 12 8zm0 0V6m0 9v2"
            />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-lg">Paid</p>
          <p className="text-white text-sm">Please Enroll</p>
        </div>
      </div>
    </div>

    {/* Diagonal Divider */}
    <div className="absolute top-0 right-0 h-full w-[150px] bg-[#FAFAF0] transform translate-x-[50%] skew-x-[-10deg] border-4 border-red-600 rounded-lg"></div>
  </div>

  
    {/* Right Section: White Background */}
    <Link to="/enrollfree">
    <div className="bg-[#FAFAF0] w-1/4"> 
    <button className="mt-6 text-white bg-red-600 px-10 py-4 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 hover:bg-red-100 hover:text-red-600 animate-bounce ">
    Enroll Now
  </button></div>
  </Link>
  </div>
  
 
   
  

      {/* What You Will Learn Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left - List of Topics */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center lg:text-left">
              What You Will Learn
            </h2>
            <ul className="list-disc space-y-4 text-lg text-gray-700 pl-6">
              <li>Mantra and How it Works</li>
              <li>Yantra and its Applications (Limited Techniques Only)</li>
              <li>
                Pancha Mahabhoot (Earth, Fire, Water, Air, Ether), Five Sense,
                Five Elements of Panchang, Definition, Effects, and
                Applications
              </li>
              <li>Vedic Lifestyle for Prosperity, Peace, and Self-Help</li>
              <li>Vaar, Tithi, Nakshatra, Yog, Karan Remedies</li>
              <li>Rashi and its Applications in Your Life</li>
              <li>Kundli and its Variations</li>
              <li>How to Read Your Chart</li>
              <li>Some Golden Rules of Astrology</li>
              <li>Gems from My Experience and Remedies</li>
              <li>How to Predict Your Day and Muhurat for Yourself</li>
            </ul>
            <p className="mt-8 text-xl text-center lg:text-left font-semibold text-red-600">
              Classes Conducted Twice Weekly - 24 Lectures + Interactive Q&A
            </p>
          </div>

          {/* Right - Course Image */}
          <div className="flex justify-center items-center">
            <img
              src="/assets/hansal sir.jpg"
              alt="Course"
              className="rounded-lg shadow-lg w-full max-w-lg"
            />
          </div>
        </div>
      </section>

      {/* Why You Should Enroll Section */}
      <section className="bg-red-50 py-16">
      
        <div className="  flex flex-row items-center justify-center max-w-7xl mx-auto px-4  ">
        
            <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Why You Should Enroll
          </h2>
          <ul className="mt-4 space-y-4 text-center text-gray-700 text-lg">
            <li>✔ Learn practical skills in less than 2 hours</li>
            <li>✔ Taught by industry experts</li>
            <li>✔ Hands-on learning with real-world applications</li>
          </ul>
          </div>
          
        </div>
      </section>

      {/* How You Learn Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            How You Learn
          </h2>
          <p className="text-lg text-gray-600">
            Gain real-world skills by practicing in a hands-on environment
            guided by experts in the field.
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Why People Choose Us
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "This course helped me land my first job in business analysis!",
                author: "John Doe",
              },
              {
                quote: "A great resource for anyone looking to upskill quickly.",
                author: "Jane Smith",
              },
              {
                quote:
                  "The guided project was very practical and easy to follow.",
                author: "Alex Taylor",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-white shadow-lg rounded-lg hover:shadow-2xl transition"
              >
                <p className="italic text-gray-700">{testimonial.quote}</p>
                <p className="mt-4 text-right text-gray-900 font-bold">
                  — {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg">
            Enroll now and unlock the secrets of astrology with our expert-led
            courses.
          </p>
          <Link to="/enroll">
          <button className="mt-6 bg-white text-red-600 px-10 py-4 text-xl rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 hover:bg-red-100">
            Enroll Now
          </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default EnrollmentPage;
