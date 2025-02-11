import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

// Define service and partner data
const services = [
  {
    title: "Courses",
    description: "Master the Art of Astrology – Learn, Grow, and Align with the Cosmos.",
    link: "/courses",
  },
  {
    title: "Consultation",
    description: "Personalized Astrological Guidance for Life’s Biggest Decisions.",
    link: "/consulting",
  },
  {
    title: "Books",
    description: "Unlock the Secrets of the Universe with Our Astrology Books.",
    link: "/blogs",
  },
];

const partners = [
  {
    name: "LAKSHYA",
    logo: "/assets/Lakshya_logo-removebg-preview.png",
    link: "#",
  },
  {
    name: "Vahlay Consulting",
    logo: "/assets/VahalyConsulting logo.webp",
    link: "https://vahlayconsulting.com/",
  },
];

const About = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <div
        className="relative h-36 md:h-96 bg-red-600 flex items-center justify-center"
        style={{ 
          backgroundImage: "url('/assets/articalsbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Oscillating Wheels */}
        <img
          src="/assets/wheel.png"
          alt="Astrology Chart"
          className="absolute w-48 h-48 sm:w-96 sm:h-96 opacity-80 animate-oscillate top-0 left-0 origin-top-left"
        />
        <img
          src="/assets/wheel.png"
          alt="Astrology Chart"
          className="absolute w-48 h-48 sm:w-96 sm:h-96 opacity-80 animate-oscillate bottom-0 right-0 origin-bottom-right"
        />

        {/* Heading */}
        <p className="relative text-xl lg:text-5xl font-extrabold text-red-600 text-center">
          Welcome to <strong className="text-2xl lg:text-7xl">Vahlay Astro</strong>
        </p>
      </div>

      {/* Core Sections */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-20 py-6 md:py-16 space-y-6 md:space-y-16">
        {/* Who We Are */}
        <section className="flex flex-col lg:flex-row items-center gap-12">
          <img src="assets/Aboutus-pg.webp" alt="Vahlay Astro Team" className="lg:w-1/2 rounded-lg shadow-lg" />
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">Who We Are</h2>
            <p className="text-gray-700">
              At <strong>Vahlay Astro</strong>, we blend ancient Vedic astrology with modern insights to guide individuals and businesses through life's challenges.
            </p>
            <h3 className="text-2xl font-bold text-red-600 mb-4">Our Philosophy</h3>
            <p className="text-gray-700">
              We empower clients through personalized consultations that provide clarity on career, relationships, and life purpose.
            </p>
          </div>
        </section>
         {/* Mission & Vision Section */}
         <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Our Ambition</h3>
            <p className="text-gray-700 text-xs lg:text-base leading-relaxed">
              Our ambition is to empower individuals to live with greater awareness, purpose, and harmony by unlocking the wisdom of the stars. We strive to provide guidance that helps our clients navigate life’s challenges and embrace opportunities.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Our Vision</h3>
            <p className="text-gray-700 text-xs lg:text-base leading-relaxed">
              Our vision is to empower individuals by blending ancient astrological wisdom with modern life, helping them align with cosmic forces to make informed decisions and lead fulfilling lives.
            </p>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="bg-gray-200 py-12 px-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Integrity", description: "Transparency and honesty in everything we do.", icon: "🛡️" },
              { title: "Empathy", description: "Understanding and addressing each client's unique needs.", icon: "🤝" },
              { title: "Innovation", description: "Blending ancient traditions with modern practices.", icon: "💡" },
              { title: "Excellence", description: "Striving for the highest quality in our services.", icon: "🏆" },
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className=" text-lg font-bold text-gray-800">{value.title}</h3>
                <p className=" text-sm  text-gray-700 mt-2">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-8">Services We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
                }}
                initial="hidden"
                whileInView="visible"
                className="relative bg-white border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6"
              >
                <h3 className="text-2xl font-semibold text-red-800">{service.title}</h3>
                <p className="text-gray-600 text-xs lg:text-sm mt-4">{service.description}</p>
                {service.link && (
                  <Link to={service.link} className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity">
                    Learn More
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        
        {/* Call to Action */}
        <section className="bg-gradient-to-r from-red-600 to-red-600 text-white py-12 px-8 rounded-lg text-center">
          <h3 className="text-lg  lg:text-2xl font-bold mb-4">Ready to Align with the Stars?</h3>
          <p className=" text-sm  lg:text-lg mb-6">Let<strong> Vahlay Astro</strong> guide you toward a future filled with clarity, harmony, and success.</p>
          <Link to="/services">
            <button className="bg-white text-red-600 px-6 py-3 text-sm  lg:text-xl rounded-lg font-semibold hover:bg-gray-100 transition">
              Explore Services
            </button>
          </Link>
        </section>
      </div>

        {/* Partners */}
        <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Our Partners</h2>
          {isMobile ? (
            <Swiper modules={[Pagination]} pagination={{ clickable: true }} slidesPerView={1} className="w-full max-w-7xl">
              {partners.map((partner, index) => (
                <SwiperSlide key={index}>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <img src={partner.logo} alt={partner.name} className="w-40 h-auto mx-auto" />
                    <p className="mt-4 font-bold text-red-600">
                      <a href={partner.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {partner.name}
                      </a>
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {partners.map((partner) => (
                <div key={partner.name} className="bg-white p-6 rounded-lg shadow-lg">
                  <img src={partner.logo} alt={partner.name} className="w-40 h-auto mx-auto" />
                  <p className="mt-4 font-bold text-red-600">
                      <a href={partner.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {partner.name}
                      </a>
                    </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    
  );
};

export default About;
