
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { collection, getDocs, doc, getDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { useState, useEffect } from "react";
import "swiper/swiper-bundle.css";
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaUserTie, FaBookOpen } from "react-icons/fa";

import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";



const Home = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);




  const testimonials = [
    {
      rating: 5,
      quote: "I had the pleasure of working with... Vahlay Astro for a birth chart reading, and it was a transformative experience. The insights I gained about my life path, career, and relationships were incredibly accurate and empowering. The consultation helped me gain clarity and confidence in making life decisions. I highly recommend their services!",
      name: "Priya S.",
      title: "Transformative and Insightful!",

    },
    {
      rating: 4,
      quote: "The astrology consultation I received from... Vahlay Astro was truly eye-opening. Not only did they provide detailed analysis, but they also offered practical advice that helped me navigate a difficult career decision. The guidance was spot on, and I now feel more aligned with my true purpose. Thank you,... Vahlay Astro!",
      name: "Raj M.",
      title: "Accurate and Uplifting Guidance",

    },
    {
      rating: 5,
      quote: "I've always been curious about astrology, but the consultation I had with... Vahlay Astro was beyond my expectations. Their deep understanding of Vedic astrology and how it applies to my life was enlightening. It has helped me in so many aspects of my personal growth, and I now have a clearer vision of my future. Truly grateful!",
      name: "Alisha T",
      title: "A Life-Changing Experience",

    },
    {
      rating: 4.5,
      quote: "I was impressed by their professionalism and innovative approach. Vahlay Consulting provided insights that completely transformed the way we operate. Highly reliable and results-driven!",
      name: "Jason Miller",
      title: "CEO",

    },
    {
      rating: 5,
      quote: "I booked a relationship compatibility reading with... Vahlay Astro, and it was incredibly insightful. The astrologer helped me understand the dynamics of my relationship in a way I had never considered before. It has improved my communication and connection with my partner. I can’t recommend their services enough!",
      name: "Samir P",
      title: "Highly Recommend for Relationship Insights",

    },
    {
      rating: 4,
      quote: "I’ve been seeking guidance on my career path, and the consultation with... Vahlay Astro was exactly what I needed. The astrologer provided practical and spiritual insights that gave me the clarity I was looking for. I’m excited about the direction I’m headed in. Thank you for the ongoing support!",
      name: "Neha R.",
      title: "Amazing Support and Clarity",

    },
  ];


  const navigate = useNavigate()
  const [courses, setCourses] = useState([]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    const fetchCourses = async () => {
      try {
        const freeCoursesSnapshot = await getDocs(collection(db, "freeCourses"));
        const freeCourses = freeCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "free",
        }));

        const paidCoursesSnapshot = await getDocs(collection(db, "paidCourses"));
        const paidCourses = paidCoursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "paid",
        }));

        setCourses([...freeCourses, ...paidCourses]);
      } catch (error) {
      }
    };

    fetchCourses();

    return () => unsubscribe();
  }, []);

  const handleCourseClick = async (course) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const subscriptionSnap = await getDoc(doc(db, "subscriptions", user.email));
      const subscriptionData = subscriptionSnap.exists() ? subscriptionSnap.data() : null;

      if (subscriptionData) {
        const enrolledCourses =
          course.type === "free"
            ? subscriptionData.freecourses || []
            : subscriptionData.DETAILS || [];

        const isEnrolled =
          course.type === "free"
            ? enrolledCourses.includes(course.title)
            : enrolledCourses.some(
              (details) =>
                details[course.title]?.status === "active" &&
                new Date(details[course.title]?.expiryDate) > new Date()
            );

        if (isEnrolled) {
          navigate("/dashboard");
        } else {
          navigate(`/coursedetail/${course.id}`, {
            state: { courseId: course.id, courseType: course.type },
          });
        }
      } else {
        navigate(`/coursedetail/${course.id}`, {
          state: { courseId: course.id, courseType: course.type },
        });
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
    }
  };


  const fetchData = async () => {
    try {
      // Query the "Articles" collection and order by "createdAt" in descending order
      const articlesQuery = query(collection(db, "Articles"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(articlesQuery);

      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(fetchedData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchData();
  }, []);

  // if (loading) return <p>Loading...</p>;



  return (
    <div className="pt-0 bg-white min-h-screen ">

      {/* Dynamic Marquee for Articles */}
      <Link to={"/articles"}>
        <marquee behavior="scroll" direction="left" className="text-red-600 bg-orange-100">
          {data.length > 0
            ? data.map((article) => article.title).join("  ·  ")
            : " "}
        </marquee>
      </Link>

      <Link to={"/articles"}>
        <marquee behavior="scroll" direction="left" className="text-red-600 bg-orange-100">
          {courses.length > 0
            ? courses.map((course) => course.title).join("  ·  ")
            : " "}
        </marquee>
      </Link>



      <section className="bg-white-50 py-8 md:py-16">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-6 px-4">
          {/* Courses */}
          <Link to={"/courses"}>
            <div className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="p-6 md:p-8 rounded-full bg-white shadow-md group-hover:shadow-lg transition-transform transform group-hover:-translate-y-2">
                <FaGraduationCap className="text-red-600 h-16 w-16 md:h-20 md:w-20" />
              </div>
              <h3 className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                Courses
              </h3>
            </div>
          </Link>

          {/* Articles */}
          <Link to={"/articles"}>
            <div className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="p-6 md:p-8 rounded-full bg-white shadow-md group-hover:shadow-lg transition-transform transform group-hover:-translate-y-2">
                <FaBookOpen className="text-red-600 h-16 w-16 md:h-20 md:w-20" />
              </div>
              <h3 className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                Articles
              </h3>
            </div>
          </Link>

          {/* Consultation */}
          <Link to={"/consulting"}>
            <div className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="p-6 md:p-8 rounded-full bg-white shadow-md group-hover:shadow-lg transition-transform transform group-hover:-translate-y-2">
                <FaUserTie className="text-red-600 h-16 w-16 md:h-20 md:w-20" />
              </div>
              <h3 className="mt-4 md:mt-6 text-lg md:text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors">
                Consultation
              </h3>
            </div>
          </Link>
        </div>
      </section>


      {/* Hero Section */}
      <div className="bg-gray-100 min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: "url('/assets/Screenshot 2024-11-28 211019.png')"
        }}>



        {/* wellcome Section */}

        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between px-6 lg:px-20">
          {/* Left Content */}
          <div className=" bg-white lg:w-1/2 text-center lg:text-left space-y-6 ">
            <p className="text-3xl lg:text-4xl font-bold text-red-600 leading-tight">
              Leads your life from Darkness to Light With <strong className='text-5xl'> Vahlay Astro</strong>    ...


            </p>
            <p className="text-gray-700 text-lg">
              Welcome to...<strong> Vahlay Astro</strong>, your trusted source for astrology education and expert guidance. Whether you're just starting your journey into the world of astrology or looking to deepen your knowledge, our courses and support services are designed to help you understand the cosmic forces that influence your life. Join our community of passionate learners and unlock the secrets of the stars!          </p>
            <Link to="/services">
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-red-700 transition mt-4">
                Services
              </button>
            </Link>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end opacity-80">
            <img
              src="/assets/new wheel.png" // Replace with the correct image path
              alt="Astrology Chart"
              className="w-4/5 lg:w-full  animate-slowspin"
            />
          </div>
        </div>

      </div>


      <div className="bg-white py-12 px-6">


      </div>




      {/* Course Section */}
      <div className="py-12 bg-gray-50 text-center">
        <div className="bg-red-600 py-4 px-4 mb-12 rounded-xl">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Courses for Astrologer
          </h2>
          <p className="text-md font-bold text-orange-200 sm:text-lg">
            It's Not Just A Course, It’s A Life-Changing Experience!
          </p>
        </div>

        <Swiper
          slidesPerView={1} // Show 1 slide for mobile
          loop={true} // Enable infinite looping
          breakpoints={{
            640: { slidesPerView: 2, loop: true }, // Show 2 slides for larger mobile screens
            1024: { slidesPerView: 3, loop: false }, // Show 3 slides for tablets and above
          }}
          spaceBetween={20} // Reduced space for better alignment on small screens
          navigation={true} // Enable navigation arrows
          pagination={{ clickable: true }} // Enable pagination dots
          modules={[Navigation, Pagination]}
          className="w-full mb-20"
        >
          {courses.map((course, index) => (
            <SwiperSlide key={index}>
              <div

                className="w-full p-4 h-[600px] bg-red-100 shadow-md rounded-xl border border-gray-300 hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300"
                onClick={() => handleCourseClick(course)} // Add the course click handler
              >
                <div className="bg-pink-100 p-4 rounded-lg mb-4">
                  <img
                    src={course.imageUrl || '/placeholder-image.jpg'} // Fallback image
                    alt={course.title || 'Course'}
                    className="w-auto h-[auto]"
                  />
                </div>
                <div>
                  <h3 className="text-center text-lg font-medium text-gray-700">
                    {course.title || 'Untitled Course'}
                  </h3>
                  <h4 className="text-center text-lg font-medium text-gray-700">
                    {course.Subtitle || 'Untitled Course'}
                  </h4>
                  {/* Conditional Link */}
                  {course.type === 'free' ? (
                    <Link
                      to={`/enrollfree/${course.id}`}
                      className="text-red-600 mt-[10px] font-bold hover:underline"
                    >
                      Enroll Now →
                    </Link>
                  ) : course.type === 'paid' ? (
                    <Link
                      to={`/enroll/${course.id}`}
                      className="text-red-600 font-bold hover:underline"
                    >
                      Enroll Now →
                    </Link>
                  ) : (
                    <p className="text-red-500 font-bold">Unknown Course Type</p>
                  )}
                </div>
              </div>
            </SwiperSlide>

          ))}

        </Swiper>
      </div>




      {/* abouts us section */}
      <div className="flex flex-col lg:flex-row items-center gap-8 px-6 py-12 bg-white  "
      >
        {/* Image Section */}
        <div className="lg:w-1/4 ">
          <img
            src="assets/About-us-hp.webp" // Replace with your actual image path
            alt="Astrology"
            className=" min-w-full h-96 rounded-lg shadow-lg mx-auto"
          />
        </div>

        {/* Text Section */}
        <div className="lg:w-3/4 text-center lg:text-left" >
          <h3 className="text-red-600 text-l uppercase tracking-wider mb-2">
            -- You Are Welcome --
          </h3>
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            About The VahlayAstro...
          </h2>
          <p className="text-gray-700 mb-6">
            ...<strong> Vahlay Astro</strong> was founded with the mission to bring the ancient wisdom of astrology into the modern world. Our experienced astrologers guide individuals and businesses through life’s most significant decisions, helping them connect deeply with the universe and understand the cycles of nature
          </p>
          <p className="text-gray-700 mb-6">
            We believe astrology empowers individuals by providing clarity and insight. Rooted in Vedic astrology, our approach is designed to meet the needs of today’s world, offering personalized support for personal growth and professional success.
          </p>
          <Link to={"/about-us"}>
            <button className="bg-red-600 text-white py-2 px-6 rounded-full hover:bg-red-700 transition-transform transform hover:scale-105 duration-300">
              Read More
            </button></Link>

        </div>
      </div>





      {/* Articles Carousel */}






      <div className="py-12 bg-gray-50 text-center">
        <div className="bg-red-600 py-4 px-4 mb-12 rounded-xl">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Featured Articles
          </h2>
          <p className="text-md font-bold text-orange-200 sm:text-lg">
            Discover insightful articles written by experts.
          </p>
        </div>

        <Swiper
          slidesPerView={1} // Show 1 slide for mobile
          loop={true} // Enable infinite looping
          breakpoints={{
            640: { slidesPerView: 2, loop: true }, // Show 2 slides for larger mobile screens
            1024: { slidesPerView: 3, loop: false }, // Show 3 slides for tablets and above
          }}
          spaceBetween={20} // Reduced space for better alignment
          navigation={true}
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination]}
          className="w-full mb-20"
        >
          {data.map((article, index) => (
            <SwiperSlide key={index}>
              <Link to={`/article/${article.id}`}>
                <div className="w-full p-4 bg-red-100 shadow-md rounded-xl border border-gray-300 hover:shadow-lg hover:-translate-y-1 transform 
          transition-all duration-300 h-[600px] flex flex-col justify-between">

                  {/* Image with Fixed Height */}
                  <div className="bg-pink-100 p-4 rounded-lg mb-4">
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt="Article"
                        className="w-full h-80 object-cover rounded-md shadow-md"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h3 className="text-center text-lg font-medium text-gray-700 sm:text-xl line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {article.hindi?.substring(0, 100)}...
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto text-center">
                    <Link to={`/article/${article.id}`} className="text-red-600 font-bold hover:underline">
                      Read More →
                    </Link>
                    <div className="mt-4 text-gray-500 text-xs sm:text-sm pb-[15px]">
                      {article.author} &bull; {new Date(article.createdAt?.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>












      {/* Appointment section */}

      <div
        className="relative h-auto bg-red-600 text-white py-16 px-6 flex flex-col items-center text-center my-40"
        style={{
          backgroundImage: "url('/assets/wheel.png')", // Replace with your actual image path
          backgroundSize: "1500px", // Ensure the background covers the container
          backgroundPosition: "center", // Center the background image
          backgroundRepeat: "no-repeat", // Prevent repetition
          className: "mx-20",
        }}
      >



        {/* Content */}
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-4xl text-orange-200 font-bold mb-4">
            Ready to Discover Your Path?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Take the next step in your astrological journey with personalized guidance from our expert astrologers. Whether you’re seeking clarity on a specific life decision, curious about your birth chart, or looking for support during a challenging time, our consultations are designed to provide insight and direction.
          </p>
          <p className="text-lg text-gray-300 mb-8">Schedule your session today!</p>
          <Link to="/appointment">
            <button className="bg-white text-red-600 py-3 px-8 rounded-full hover:bg-red-700 hover:text-white transform hover:scale-105 transition duration-300">
              Book Now
            </button>
          </Link>
        </div>
      </div>



      {/* Consulting. */}
      <div className="bg-gray-50 py-16 px-6 lg:px-20 flex flex-col lg:flex-row items-center">
        {/* Text Section */}
        <div className="lg:w-3/4  my-20 lg:mb-auto lg:pr-10 ">
          <h2 className="text-3xl font-bold text-red-600 mb-4">What We Do...</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            At...<strong> Vahlay Astro</strong>, we provide expert astrology consulting to guide you through life’s most pivotal decisions. Our personalized consultations offer deep insights into your birth chart, relationships, career, and life purpose, helping you navigate challenges and seize opportunities. With a focus on Vedic astrology, we empower you with actionable remedies and cosmic guidance to align with your true path. Our mission is to bring clarity, balance, and purpose to your journey, enabling you to make informed decisions and live a more fulfilling life.
          </p>
          <Link to={"/consulting"}>
            <button className="bg-red-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700">
              Read More
            </button>
          </Link>
        </div>

        {/* Image Section */}
        <div className="lg:w-3/12">
          <img
            src="assets/what-we-do-hp.webp" // Replace with your image path
            alt="What We Do Illustration"
            className="rounded-lg shadow-lg min-w-auto h-auto"
          />
        </div>
      </div>








      {/* Feedback Section */}

      <div
        className="relative h-auto bg-red-600 text-white py-16 px-6 flex flex-col items-center text-center "
        style={{
          backgroundImage: "url('/assets/wheel.png')", // Replace with your actual image path
          backgroundSize: "1500px", // Ensure the background covers the container
          backgroundPosition: "center", // Center the background image
          backgroundRepeat: "no-repeat", // Prevent repetition    
          className: "mx-20",
        }}
      >


        <div className="relative z-10 max-w-3xl">
          <h2 className="text-5xl font-bold mb-4 text-orange-200">

            Happy Client Testimonials
          </h2>
        </div>
      </div>


      {/* Grid Layout */}
      <div className="flex justify-center my-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transform transition duration-300 hover:scale-105 ${index % 2 === 0
                ? "bg-red-600 text-white"
                : "bg-white text-gray-800 dark:bg-red-800 dark:text-white"
                }`}
              style={{
                backgroundImage: "url('assets/cardbg-hp.png')"
              }}
            >

              <h3
                className={`text-2xl font-semibold ${index % 2 === 0
                  ? "text-white"
                  : "text-gray-800 dark:text-white"
                  }`}
              >
                {testimonial.name}
              </h3>
              <p
                className={`text-sm mb-2 ${index % 2 === 0
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400"
                  }`}
              >
                {testimonial.title}
              </p>
              <div
                className={`flex justify-center gap-1 ${index % 2 === 0 ? "text-yellow-300" : "text-yellow-500"
                  } mb-4`}
              >
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i}>&#9733;</span> // Star symbol
                ))}
              </div>
              <p
                className={`text-sm ${index % 2 === 0
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-300"
                  }`}
              >
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Copartners Section */}

      <div className="flex flex-col items-center justify-center min-h-auto bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-8">
        {/* Header */}
        <h1 className="text-5xl font-extrabold text-white mb-16 text-center">
          Our Partners
        </h1>

        {/* Container for all logos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-7xl">


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

export default Home;




