import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="bg-red-600 text-white py-12 relative">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/assets/footer_BG.png')", // Replace with your actual image path
          // backgroundImage: "url('/assets/footer-bg.jpg')", // Replace with your actual image path
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gray-800 opacity-30"></div>
      </div>

      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* About Section */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-orange-200">Vahlay Astro</h3>
          <p className="text-sm leading-relaxed mb-4">
        <strong> Vahlay Astro</strong>, your trusted partner in unlocking the
            mysteries of the cosmos. We offer tailored solutions for personal growth,
            success, and happiness.
          </p>
          <p className="text-sm leading-relaxed">
            Our mission is to help you achieve a deeper understanding of the
            cosmic world, offering guidance for life decisions and insights into
            your future.
          </p>
          <div className="mt-5">       
      <Link to="/login" className="block ">
  <button className="bg-white text-red-600 font-bold py-1 px-6 rounded-full shadow-md hover:bg-red-600 hover:text-white hover:shadow-lg transition duration-300 ease-in-out">
    Login 
  </button>
</Link>
</div>
        

        </div>
      


        {/* Overview Section */}
        <div>
          <h3 className="text-lg font-bold text-orange-200 mb-4">Overview</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/about-us" className="hover:text-gray-300">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-gray-300">
                Services
              </Link>
            </li>
            <li>
              <Link to="/articles" className="hover:text-gray-300">
                Articles
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-gray-300">
                Courses
              </Link>
            </li>
              <li>
              <Link to="/appointment" className="hover:text-gray-300">
                Appointment
                </Link>
            </li>
            <li>
              <Link to="/consulting" className="hover:text-gray-300">
                Consulting
                </Link>
            </li>
           
          </ul>
        </div>

        {/* Courses Section */}
        <div>
          <h3 className="text-lg font-bold text-orange-200 mb-4">Courses</h3>
          <ul className="space-y-2">
            <li>
              <Link to="#" className="hover:text-gray-300">
                New Edge Bhagavad Gita
                </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gray-300">
                Narad Puran
                </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gray-300">
                Foundations of Vedic Astrology
                </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gray-300">
                The Essentials of Self-Discovery
                </Link>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-lg font-bold text-orange-200 mb-4">Contact Details</h3>
          <ul className="space-y-2 text-sm">
            <li>Email: contact@vahlayastro.com</li>
            <li>LandLine: +91 79 4921 7538</li>
           
          </ul>
          <h3 className="text-lg font-bold mt-6 text-orange-200 mb-2">Locations</h3>
          <p className="text-sm">C 515, Dev Aurum Commercial Complex,  Prahlad Nagar, Ahmedabad, Gujarat 380015</p>
          <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d7344.671029626906!2d72.51501100000002!3d23.01145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1733872195045!5m2!1sen!2sin" 
            width="100%"
            height="160"
            className="border-0 rounded-lg shadow-lg mt-4"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>



   {/* Social Media Icons */}
   <div className="relative z-10 flex justify-center space-x-4 mt-10">
        <a href="https://www.facebook.com/profile.php?id=61572501694342" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-300 transition">
          <FaFacebookF size={24} />
        </a>
        <a href="https://x.com/VahlayAstro2009" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-300 transition">
          <FaTwitter size={24} />
        </a>
        <a href="https://www.instagram.com/astro_vahlay_09/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-300 transition">
          <FaInstagram size={24} />
        </a>
        <a href="http://youtube.com/@VahlayAstro" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-300 transition">
          <FaYoutube size={24} />
        </a>
      </div>


      {/* Footer Bottom Section */}
      <div className="relative z-10 text-center text-sm text-gray-400 mt-12">
        © 2024 Vahlay Consulting. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
