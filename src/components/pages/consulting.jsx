import React from "react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

const Consulting = () => {
  const consult = [
    {
      title: "Personalized Astrological Guidance",
      description:
        "Dive deep into your unique astrological chart for clarity on relationships, career, and personal growth.",
      img: "/assets/Personalized Astrological Guidance.webp",
    },
    {
      title: "Life Path and Destiny Consultation",
      description:
        "Unlock your life's purpose, navigate challenges, and seize opportunities by exploring your unique astrological blueprint.",
      img: "/assets/Life Path and Destiny Consultation.webp",
    },
    {
      title: "Career and Success Consultation",
      description:
        "Identify your ideal career path, unlock potential, and align your work with the strengths in your astrological chart.",
      img: "/assets/Career and Success Consultation.webp",
    },
    {
      title: "Relationship Compatibility Reading",
      description:
        "Analyze relationship dynamics for better communication and harmony.",
      img: "/assets/Relationship Compatibility Reading.webp",
    },
    {
      title: "Remedial Astrology Consultation",
      description:
        "Address planetary imbalances with proven astrological remedies.",
      img: "/assets/Remedial Astrology Consultation.webp",
    },
    {
      title: "Ongoing Support and Guidance",
      description:
        "Stay aligned with personalized follow-up sessions and continuous support.",
      img: "/assets/Ongoing Support and Guidance.webp",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen text-sm">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-600 text-white py-28">
     
      <img
          src="/assets/elements2.png"
          alt="Astrology Chart"
          className="absolute w-96 h-96 opacity-80 md:animate-slowspin top-1 md:top-1/2 md:left-1/5"
        />
        <div className="relative z-10 text-center">
          <h1 className=" text-xl md:text-4xl font-extrabold">
            Empower Your Life with <span className="text-orange-200">Vahlay Astro</span>
          </h1>
          <p className="mt-6 text-lg max-w-3xl mx-auto">
            Unlock your potential with expert astrological consulting. Discover clarity, purpose, and balance in every aspect of your life.
          </p>
         
        </div>
        <img
          src="/assets/elements2.png"
          alt="Astrology Chart"
          className="absolute w-96 h-96 opacity-80 animate-slowspin top-0 right-0 md:block hidden   "
        />
      </section>

      {/* Consulting Services */}
      <section className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        {/* Section Title */}
        <h2 className="text-xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">
          Explore Our Consulting Services
        </h2>

        {/* Grid of Services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {consult.map((service, index) => (
            <motion.div
              key={index}
              className="relative bg-gradient-to-br from-red-100 to-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:shadow-2xl hover:scale-105"
              whileHover={{ scale: 1.05 }}
            >
              {/* Service Image */}
              <img
                src={service.img}
                alt={service.title}
                className="h-56 w-full object-cover"
              />

              {/* Service Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-lg md:text-2xl font-bold text-red-600">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>

              {/* Call-to-Action */}
              <div className="p-6 pt-0">
                <Link
                  to="/appointment"
                  className="inline-block text-red-600 text-sm font-semibold hover:underline"
                >
                  Book An Appointment NOW &gt;
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

      {/* Redesigned Testimonials Section */}
<section className="bg-gradient-to-b from-red-50 to-white py-20">
  <div className="max-w-7xl mx-auto px-6 lg:px-16">
    <h2 className="text-xl md:text-4xl font-bold text-center text-gray-800 mb-12">
      What Our Clients Say
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((_, i) => (
        <motion.div
          key={i}
          className="relative bg-white shadow-md rounded-lg p-8 text-center flex flex-col items-center justify-center hover:shadow-lg hover:scale-105 transition-transform"
          whileHover={{ scale: 1.05 }}
        >
          
          <p className="italic text-gray-700 mb-4">
            "Astrology helped me unlock opportunities I never saw before. A
            truly life-changing experience!"
          </p>
          <h4 className="font-bold text-red-600">- Client {i + 1}</h4>
        </motion.div>
      ))}
    </div>
  </div>
</section>


      {/* Final Call-to-Action Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-4xl font-bold mb-6">
            Ready to Align with the Stars?
          </h2>
          <p className=" mb-6">
            Book your personalized consultation today and step into a world of clarity, purpose, and balance.
          </p>
          <Link to="/appointment">
          <button className="bg-yellow-300 text-red-800 px-10 py-4 rounded-full font-bold shadow-lg hover:bg-yellow-400 transition">
            Schedule a Session
          </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Consulting;
