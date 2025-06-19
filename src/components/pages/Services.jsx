import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Services = () => {
  const services = [
    {
      title: "Courses",
      img: "/assets/courses.jpg",
      description: "Read More",
      link: "/courses",
    },
    {
      title: "Consultation",
      img: "/assets/consulting.webp",
      description: "Read More",
      link: "/consulting",
    },
    {
      title: "Articles",
      img: "/assets/books.webp",
      description: "Read More",
      link: "/articles",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-gray-50 min-h-screen text-sm">
      {/* Hero Section */}
      <div className="relative bg-gray-50" style={{
  backgroundImage: "url('/assets/Screenshot 2024-11-28 211019.png')"
}}>
        <div className="max-w-screen-xl mx-auto px-6 lg:px-20 py-12 lg:py-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Section - Text */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <motion.h1
              className="text-xl md:text-4xl font-bold text-red-600 leading-tight"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              Unlock the Secrets <br />
              of the <span className="text-gray-800">Vahlay Astro</span>
            </motion.h1>
            <motion.p
              className="text-gray-700  leading-relaxed"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              Discover our astrology services designed to provide insights and guidance 
              to help you align with your life's purpose.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2 }}
            >
              
            </motion.div>
          </div>

          {/* Right Section - Image */}
          <motion.div
            className="md:flex-1 flex items-center justify-between"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
             
          <img
            src="/assets/wheel.png" // Replace with the correct image path
            alt="Astrology Chart"
           className="lg:w-full animate-slowspin"
          />
       
          </motion.div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xl md:text-4xl font-bold text-red-800">What We Offer</h2>
          <p className="text-gray-600 mt-4">
            We provide a range of astrology services designed to help you unlock deeper insights into your life.
          </p>
        </motion.div>

        {/* Cards Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="relative bg-white border-orange-100  rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              variants={cardVariants}
            >
              <img
                src={service.img}
                alt={service.title}
                className="h-60 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-red-800">
                  {service.title}
                </h3>
                <p className="text-gray-600 mt-4">{service.description}</p>
              </div>
              {service.link ? (
                <Link to={service.link}>
                  <motion.div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center text-white text-lg font-semibold opacity-0 hover:opacity-100 transition-opacity duration-300">
                    Learn More
                  </motion.div>
                </Link>
              ) : (
                <motion.div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex items-center justify-center text-white text-lg font-semibold opacity-0 hover:opacity-100 transition-opacity duration-300">
                  Learn More
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
