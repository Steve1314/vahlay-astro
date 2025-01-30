import React from "react";

const CoPartners = () => {
  const partners = [
    // {
    //   name: "Vahlay Astro",
    //   description:
    //     "Vahlay Astro offers personalized astrology insights, expert consultations, and interactive courses to deepen your understanding of the cosmos. Discover advanced tools and resources that bridge ancient wisdom with modern life, empowering your journey of self-awareness and spiritual growth..",
    //   logo: "/assets/vahlay_astro.png", // Replace with your logo path
    //   link: "https://vahlayastro.com/",
    // },
    {
      name: "Lakshya",
      description:
        "Lakshya Samaj Seva Charitable Trust is dedicated to uplifting communities through impactful initiatives in education, healthcare, and social welfare. Join us in making a difference and creating a brighter future for those in need. Together, we can transform lives.",
      logo: "/assets/Lakshya_logo_withoutbg.png", // Replace with your logo path
      link: "#",
    },
    {
      name: "Vahlay Consulting",
      description:
        "Vahlay Consulting specializes in empowering businesses with tailored strategies and innovative solutions. Our expert team drives growth, streamlines operations, and fosters success, delivering results that align with your vision and help you achieve your goals effectively.",
      logo: "/assets/VahalyConsulting logo.webp", // Replace with your logo path
      link: "https://vahlayconsulting.com/",
    },
  ];

  return (
    <div className="bg-red-600">
      {/* Header */}
      <div className="bg-white h-24 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-center text-black">
          OUR CO-PARTNERS
        </h1>
      </div>

      {/* Partners Section */}
      <div className="flex flex-col gap-8">
        {partners.map((partner, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center ${
              index % 2 === 1 ? "md:flex-row-reverse  " : ""
            } bg-gray-200 border-t-4 border-red-500 rounded-lg shadow-lg p-8 m-4`}
          >
            {/* Partner Logo */}
            <div className="flex-shrink-0 w-72 h-72 rounded-full overflow-hidden bg-white">
              <img
                src={partner.logo}
                alt={`${partner.name} Logo`}
                className="object-contain w-full h-full"
              />
            </div>

            {/* Partner Content */}
            <div className="flex flex-col flex-1 ml-0 md:ml-6 md:mr-6 text-center md:text-left">
              <h2 className="text-xl font-bold text-black">{partner.name}</h2>
              <p className="mt-2 text-base text-gray-700">
                {partner.description}
              </p>
              <a
                href={partner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm font-bold text-red-500 hover:underline"
              >
                Visit website
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoPartners;
