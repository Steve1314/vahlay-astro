import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const About = () => {
  const services = [
    {
      title: "Courses",
      description: "Master the Art of Astrology – Learn, Grow, and Align with the Cosmos",
      link: "/courses",
    },
    {
      title: "Consultation",
      description: "Personalized Astrological Guidance for Life’s Biggest Decisions",
      link: "/consulting",
    },
    {
      title: "Books",
      description: "Unlock the Secrets of the Universe with Our Astrology Books",
      link: "/blogs",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section with Oscillating Wheel */}
      <div className="relative h-96 bg-red-600 flex items-center justify-center"
        style={{
          backgroundImage: "url('/assets/articalsbg.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}>
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
        <p className="relative text-3xl lg:text-5xl font-extrabold text-red-600 z-10">
          Welcome to<strong className="text-4xl"> Vahlay Astro</strong>
        </p>
      </div>

      {/* Core Sections */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-20 py-16 space-y-16">
        {/* Who We Are Section */}
        <section className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          <div className="lg:w-1/2">
            <img
              src="assets/Aboutus-pg.webp"
              alt="Vahlay Astro Team"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Who We Are</h2>
            <p className="text-gray-700 leading-relaxed">
              At<strong> Vahlay Astro</strong>, we bring ancient Vedic astrology into the modern world to help individuals and businesses navigate life’s challenges with clarity. Astrology is more than prediction; it's a tool to understand the deeper connections between ourselves and the universe.
            </p>
            <h3 className="text-2xl font-bold text-red-600 mb-4">Our Philosophy</h3>
            <p className="text-gray-700 leading-relaxed">
              We empower our clients by offering personalized consultations that guide them through career decisions, relationships, and life’s purpose, helping them align with the cosmic forces around them.
            </p>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Our Ambition</h3>
            <p className="text-gray-700 leading-relaxed">
              Our ambition is to empower individuals to live with greater awareness, purpose, and harmony by unlocking the wisdom of the stars. We strive to provide guidance that helps our clients navigate life’s challenges and embrace opportunities.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              Our vision is to empower individuals by blending ancient astrological wisdom with modern life, helping them align with cosmic forces to make informed decisions and lead fulfilling lives.
            </p>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="bg-gray-200 py-12 px-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Integrity", description: "Transparency and honesty in everything we do.", icon: "🛡️" },
              { title: "Empathy", description: "Understanding and addressing each client's unique needs.", icon: "🤝" },
              { title: "Innovation", description: "Blending ancient traditions with modern practices.", icon: "💡" },
              { title: "Excellence", description: "Striving for the highest quality in our services.", icon: "🏆" },
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-lg font-bold text-gray-800">{value.title}</h3>
                <p className="text-gray-700 mt-2">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-3xl font-bold text-red-600 text-center mb-8">Services We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="relative bg-white border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-red-800">{service.title}</h3>
                  <p className="text-gray-600 mt-4">{service.description}</p>
                </div>
                {service.link && (
                  <Link to={service.link}>
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center text-white text-lg font-semibold opacity-0 hover:opacity-100 transition-opacity duration-300">
                      Learn More
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-red-600 to-red-600 text-white py-12 px-8 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Align with the Stars?</h3>
          <p className="text-lg mb-6">Let<strong> Vahlay Astro</strong> guide you toward a future filled with clarity, harmony, and success.</p>
          <Link to="/services">
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Explore Services
            </button>
          </Link>
        </section>
      </div>

      {/* Copartners Section */}

      <div className="flex flex-col items-center justify-center min-h-auto bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-8">
        {/* Header */}
        <h1 className="text-5xl font-extrabold text-white mb-16 text-center">
          Our Partners
        </h1>

        {/* Container for all logos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-7xl">
          {/* First logo */}
          {/* <div className="relative flex flex-col items-center bg-white p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-red-400 via-red-500 to-red-600 blur-3xl opacity-20 rounded-3xl -z-10"></div>
      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 border-4 border-red-500 rounded-full overflow-hidden transform hover:scale-110 transition-transform duration-300">
        <img
          src="/assets/vahlay_astro.png"
          alt="Vahlay Astro Logo"
          className="object-contain w-40 h-40"
        />
      </div>
      <p className="mt-6 text-center text-lg font-bold text-red-600">
        <a
          href="https://vahlayastro.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Vahlay Astro
        </a>
      </p>
    </div> */}

          {/* Second logo */}
          <div className="relative flex flex-col items-center bg-white p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-red-400 via-red-500 to-red-600 blur-3xl opacity-20 rounded-3xl -z-10"></div>
            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 border-4 border-red-500 rounded-full overflow-hidden transform hover:scale-110 transition-transform duration-300">
              <img
                src="/assets/Lakshya_logo-removebg-preview.png"
                alt="Lakshya Logo"
                className="object-contain
           w-40 h-40"
              />
            </div>
            <p className="mt-6 text-center text-lg font-bold text-red-600">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                LAKSHYA
              </a>
            </p>
          </div>

          {/* Third logo */}
          <div className="relative flex flex-col items-center bg-white p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-red-400 via-red-500 to-red-600 blur-3xl opacity-20 rounded-3xl -z-10"></div>
            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 border-4 border-red-500 rounded-full overflow-hidden transform hover:scale-110 transition-transform duration-300">
              <img
                src="/assets/VahalyConsulting logo.webp"
                alt="Vahlay Consulting Logo"
                className="object-contain w-40 h-40"
              />
            </div>
            <p className="mt-6 text-center text-lg font-bold text-red-600">
              <a
                href="https://vahlayconsulting.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Vahlay Consulting   
              </a>
            </p>
          </div>
        </div>
      </div>





    </div>
  );
};

export default About;
