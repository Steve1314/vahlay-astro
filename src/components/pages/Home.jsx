
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
  const [isMobile, setIsMobile] = useState(false);
  

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const testimonials = [
    {
      rating: 5,
      quote: "The Essentials of Self-Discovery (Panchang and Basic Astrology) truly changed how I view astrology. I used to think it was all about predictions, but this course opened my eyes to how deeply Panchang aligns with daily life. Valay Sir’s explanations were so relatable—it felt less like a class and more like a personal exploration.",
      name: "Nirav Deshmukh",
      title: "The Essentials of Self-Discovery (Panchang and Basic Astrology)",
    },
    {
      rating: 4,
      quote: "I joined The Essentials of Self-Discovery course mainly out of curiosity, but I ended up connecting with myself on a whole new level. The way Panchang was broken down made it feel so relevant to everyday life. The course gave me a beautiful foundation in astrology without ever feeling overwhelming.",
      name: "Malvi Vashi",
      title: "The Essentials of Self-Discovery (Panchang and Basic Astrology)",
    },
    {
      rating: 4.5,
      quote: "Taking The Essentials of Self-Discovery was like being handed a mirror. It helped me understand cycles and energies that I had felt before but never really understood. The Panchang section especially gave me a new appreciation for timing. Valay Sir’s calm, grounded approach made it easy to grasp even the more complex ideas.",
      name: "Vishal Patel",
      title: "The Essentials of Self-Discovery (Panchang and Basic Astrology)",
    },
    {
      rating: 4,
      quote: "From the very first session of The Essentials of Self-Discovery (Panchang and Basic Astrology), I felt a shift. Valay Sir doesn’t just teach—he guides. The knowledge shared was practical and meaningful. I now feel more aware of my days, my choices, and even my natural strengths. A great introduction to astrology.",
      name: "Viren Tailor",
      title: "The Essentials of Self-Discovery (Panchang and Basic Astrology)",
    },
    {
      rating: 5,
      quote: "I had no background in astrology before joining The Essentials of Self-Discovery (Panchang and Basic Astrology), but the course made me feel comfortable from the start. Every topic felt relevant, and I loved how the Panchang concepts were explained with real-life examples. It has become part of how I approach my days now.",
      name: "Mansi Khambhati",
      title: "The Essentials of Self-Discovery (Panchang and Basic Astrology)",
    },
    {
      rating: 4.5,
      quote: "Before taking the Foundation of Vedic Astrology course, I only knew astrology at a surface level. This course helped me understand the deeper structure—the logic behind the planets, signs, and houses. What I appreciated the most was how everything was explained in a step-by-step manner. It’s not just about learning—it’s about truly understanding. Highly recommended for anyone serious about getting into Vedic astrology.",
      name: "Nishant Tailor",
      title: "Foundation of Vedic Astrology",
    },
    {
      rating: 4,
      quote: "This course gave me the confidence to actually read and understand a birth chart. I always found astrology interesting but intimidating. The Foundation of Vedic Astrology course changed that completely. Valay Sir has a way of making complex things sound simple. I’ve even started helping friends interpret their charts. Feels great to have that kind of knowledge!",
      name: "Jay Kantharia",
      title: "Foundation of Vedic Astrology",
    },
    {
      rating: 5,
      quote: "The Foundation of Vedic Astrology course was an eye-opener. I didn’t expect to connect with the subject so deeply, but every session sparked more curiosity. Learning about the planets and their influence gave me a fresh perspective on life, and I started noticing patterns I never paid attention to before. It’s a solid foundation for anyone who wants to take astrology seriously.",
      name: "Dharmesh Patil",
      title: "Foundation of Vedic Astrology",
    },
    {
      rating: 4.5,
      quote: "I joined the Foundation of Vedic Astrology course because I wanted clarity—not just knowledge from books or YouTube. This course gave me that clarity. It built a proper base from the fundamentals, and every class felt connected and purposeful. I liked how we were encouraged to question and think, not just memorize. It's definitely one of the best decisions I made recently.",
      name: "Manan Patel",
      title: "Foundation of Vedic Astrology",
    },
  ];
  

  const col1 = testimonials.filter((_,i) => i % 3 == 0)
  const col2 = testimonials.filter((_,i) => i % 3 == 1)
  const col3 = testimonials.filter((_,i) => i % 3 == 2)

  const scrollSpeeds = [
    "animate-scroll-slow",
    "animate-scroll-medium",
    "animate-scroll-fast",
  ];
  

  const partners = [
    {
      name: "LAKSHYA",
      logo: "/assets/Lakshya_logo-removebg-preview.png",
      link: "#",
    },
    {
      name: "Vahlay Consulting",
      logo: "/assets/VahalyConsulting logo.png",
      link: "https://vahlayconsulting.com/",
    },
    {
      name:"Neal Foundation",
      logo:"/assets/NealFoundation Logo.png",
      link: "https://nealfoundation.com/",
    },
  ];





  const navigate = useNavigate()
  const [courses, setCourses] = useState([]);


   // Handle mobile resizing
   useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch courses from Firestore and sort them
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
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
   
           const combinedCourses = [...paidCourses, ...freeCourses];
   
           const orderDoc = await getDoc(doc(db, "courseOrder", "displayOrder"));
           if (orderDoc.exists()) {
             const orderedIds = orderDoc.data().order;
             const orderedCourses = orderedIds
               .map(id => combinedCourses.find(c => c.id === id))
               .filter(c => c); // only keep found courses
   
             // Find remaining courses not in the order list
             const remainingCourses = combinedCourses.filter(c => !orderedIds.includes(c.id));
   
             // Combine both ordered and remaining courses
             const finalCourses = [...orderedCourses, ...remainingCourses];
   
             setCourses(finalCourses);
           } else {
             setCourses(combinedCourses);
           }
         } catch (error) {
           console.error("Error fetching courses:", error);
           alert("Failed to fetch courses. Please try again later.");
         }
       };

    fetchCourses();
    return () => unsubscribe();
  }, []);

  // Fetch articles for marquee
  const fetchData = async () => {
    try {
      const articlesQuery = query(collection(db, "Articles"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(articlesQuery);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle course click for enrollment
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
          navigate("/enrolledcourse");
        } else {
          navigate(`/coursedetail/${course.id}/${course.type}`, {
            state: { courseId: course.id, courseType: course.type },
          });
        }
      } else {
        navigate(`/coursedetail/${course.id}/${course.type}`, {
          state: { courseId: course.id, courseType: course.type },
        });
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      alert("An error occurred. Please try again later.");
    }
  };
console.log(courses)

  useEffect(() => {
    fetchData();
  }, []);

  // if (loading) return <p>Loading...</p>;



  return (
    <div className="pt-0 bg-white min-h-screen text-sm ">

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



      <section className="bg-white-50 mb-2 md:py-16 text-sm">
  <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-6 px-4 text-2xl">
    {/* Courses */}
    <Link to={"/courses"}>
      <div className="flex flex-col items-center justify-center cursor-pointer group">
        <div className="p-6 md:p-8 rounded-full bg-white shadow-md transition-transform transform group-hover:animate-bounce">
          <FaGraduationCap className="text-red-600 h-10 w-10 md:h-20 md:w-20" />
        </div>
        <h3 className="mt-4 md:mt-6 font-bold text-red-600 group-hover:text-red-700 transition-colors">
          Courses
        </h3>
      </div>
    </Link>

    {/* Articles */}
    <Link to={"/articles"}>
      <div className="flex flex-col items-center justify-center cursor-pointer group">
        <div className="p-6 md:p-8 rounded-full bg-white shadow-md transition-transform transform group-hover:animate-bounce">
          <FaBookOpen className="text-red-600 h-10 w-10 md:h-20 md:w-20" />
        </div>
        <h3 className="mt-4 md:mt-6 font-bold text-red-600 group-hover:text-red-700 transition-colors">
          Articles
        </h3>
      </div>
    </Link>

    {/* Consultation */}
    <Link to={"/consulting"}>
      <div className="flex flex-col items-center justify-center cursor-pointer group">
        <div className="p-6 md:p-8 rounded-full bg-white shadow-md transition-transform transform group-hover:animate-bounce">
          <FaUserTie className="text-red-600 h-10 w-10 md:h-20 md:w-20" />
        </div>
        <h3 className="mt-4 md:mt-6 font-bold text-red-600 group-hover:text-red-700 transition-colors">
          Consultation
        </h3>
      </div>
    </Link>
  </div>
</section>



      {/* Hero Section */}
      <div className="bg-gray-100  mt-0 mb-2 flex items-center justify-center"
        style={{
          backgroundImage: "url('/assets/Screenshot 2024-11-28 211019.png')"
        }}>



        {/* wellcome Section */}

        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between px-6 lg:px-20">
          {/* Left Content */}
          <div className=" bg-white mt-3 lg:w-1/2 text-center lg:text-left space-y-6 ">
            <p className="text-base md:text-2xl font-bold text-red-600 leading-tight">
              Leads your life from Darkness to Light With <strong className='  text-xl md:text-4xl'> Vahlay Astro</strong>    ...


            </p>
            <p className="text-gray-700  ">
              Welcome to...<strong> Vahlay Astro</strong>, your trusted source for astrology education and expert guidance. Whether you're just starting your journey into the world of astrology or looking to deepen your knowledge, our courses and support services are designed to help you understand the cosmic forces that influence your life. Join our community of passionate learners and unlock the secrets of the stars!          </p>
            <Link to="/services">
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-red-700 transition mt-4">
                Services
              </button>
            </Link>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2 flex justify-center  lg:justify-end opacity-80">
            <img
              src="/assets/new wheel.png" // Replace with the correct image path
              alt="Astrology Chart"
              className="w-4/5 lg:w-full  animate-slowspin"
            />
          </div>
        </div>

      </div>



      {/* Course Section */}
      <div className=" py-2 mx-4 lg:py-12  bg-gray-50 text-center">
        <div className="bg-red-600  py-4 px-4 mb-2 lg:mb-12 rounded-xl">
          <h2 className="text-center  text-xl md:text-4xl font-bold text-white sm:text-3xl">
            Courses for Astrologer
          </h2>
          <p className=" font-bold text-orange-200 sm:text-lg">
            It's Not Just A Course, It’s A Life-Changing Experience!
          </p>
        </div>

        <Swiper
          slidesPerView={1} // Show 1 slide for mobile
          loop={true} // Enable infinite looping
          breakpoints={{
            640: { slidesPerView: 2, loop: true }, // Show 2 slides for larger mobile screens
            1024: { slidesPerView: 3, loop: true }, // Show 3 slides for tablets and above
          }}
          spaceBetween={20} // Reduced space for better alignment on small screens
          navigation={true} // Enable navigation arrows
          pagination={{ clickable: true }} // Enable pagination dots
          modules={[Navigation, Pagination]}
          className="w-full mb-8  md:mb-20"
        >
          {courses.map((course, index) => (
            <SwiperSlide key={index} className='mb-8'>
              <div
                className="w-full p-4 h-auto  bg-red-100 shadow-md rounded-xl border border-gray-300 hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300"
                onClick={() => handleCourseClick(course)} // Add the course click handler
              >
                <div className="bg-pink-100 p-4 rounded-lg mb-2">
                <div className="absolute top-0 left-2 m-2  rounded-full shadow-lg flex items-center justify-center">
                  <img
                     src="/assets/vahlay_astro.png"
                    alt="logo"
                    className=" w-14 h-14 bg-white object-contain rounded-full"
                  />
                </div>
                  <img
                    src={course.imageUrl || '/placeholder-image.jpg'} // Fallback image
                    alt={course.title || 'Course'}
                    className="w-full h-64 lg:h-auto object-cover rounded-md shadow-md mx-auto"
                  />
                </div>

                <div className="text-center">
                  {/* Title with Single Line Truncation */}
                  <h3
                    className="text-base   font-medium text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis block"
                    title={course.title} // Full title on hover
                  >
                    {course.title}
                  </h3>

                  {/* Conditional Link */}
                  {course.type === "free" ? (
                    <Link to={`/enrollfree/${course.id}/${course.type}`} className="block mb-3 text-center text-white bg-red-600 font-medium py-2 rounded-lg hover:bg-red-700 transition">
                      Enroll Now →
                    </Link>
                  ) : course.type === "paid" ? (
                    <Link to={`/enroll/${course.id}/${course.type}`} className="block mb-3 text-center text-white bg-red-600 font-medium py-2 rounded-lg hover:bg-red-700 transition">
                      Enroll Now →
                    </Link>
                  ) : (
                    <p className="text-center mb-3 text-red-500 font-semibold">Unknown Course Type</p>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>




      {/* abouts us section */}
      <div className="flex flex-col lg:flex-row items-center gap-8 px-6 lg:py-12 bg-white  "
      >
        {/* Image Section */}
        <div className="lg:w-1/4 ">
          <img
            src="assets/About-us-hp.webp" // Replace with your actual image path
            alt="Astrology"
            className=" min-w-full  lg:h-96 rounded-lg shadow-lg mx-auto"
          />
        </div>

        {/* Text Section */}
        <div className="lg:w-3/4 text-center lg:text-left " >
          <h3 className="text-red-600 text-l uppercase tracking-wider mb-2">
            -- You Are Welcome --
          </h3>
          <h2 className=" text-xl md:text-4xl font-bold text-gray-800 mb-4">
            About The VahlayAstro...
          </h2>
          <p className="text-gray-700 mb-6">
            ...<strong> Vahlay Astro</strong> was founded with the mission to bring the ancient wisdom of astrology into the modern world. Our experienced astrologers guide individuals and businesses through life’s most significant decisions, helping them connect deeply with the universe and understand the cycles of nature
          </p>
          <p className="text-gray-700 mb-6">
            We believe astrology empowers individuals by providing clarity and insight. Rooted in Vedic astrology, our approach is designed to meet the needs of today’s world, offering personalized support for personal growth and professional success.
          </p>
          <Link to={"/about-us"}>
            <button className="bg-red-600 text-white py-1 px-6 rounded-full hover:bg-red-700 transition-transform transform hover:scale-105 duration-300">
              Read More
            </button></Link>

        </div>
      </div>





      {/* Articles Carousel */}


      <div className="   py-6 lg:py-12 bg-gray-50 text-center m-4">
        <div className="bg-red-600 py-4 px-4 mb-12 rounded-xl">
          <h2 className="text-center text-xl md:text-4xl font-bold text-white ">
            Featured Articles
          </h2>
          <p className=" font-bold text-orange-200 text-lg">
            Discover insightful articles written by experts.
          </p>
        </div>

        <Swiper
          slidesPerView={1} // Show 1 slide for mobile
          loop={true} // Enable infinite looping
          breakpoints={{
            640: { slidesPerView: 2, loop: true }, // Show 2 slides for larger mobile screens
            1024: { slidesPerView: 3, loop: true }, // Show 3 slides for tablets and above
          }}
          spaceBetween={20} // Reduced space for better alignment
          navigation={true}
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination]}
          className="w-full mb-6 lg:mb-20"
        >
          {data.map((article, index) => (
            <SwiperSlide key={index} className='mb-6'>
              <Link to={`/article/${article.id}`}>
                <div className="w-full p-4 bg-red-100 shadow-md rounded-xl border border-gray-300 hover:shadow-lg hover:-translate-y-1 transform 
          transition-all duration-300 h-auto  flex flex-col justify-between">

                  {/* Image with Fixed Height */}
                  <div className="bg-pink-100 p-4 rounded-lg mb-4">
                  <div className="absolute top-0 left-2 m-2   rounded-full shadow-lg flex items-center justify-center">
                  <img
                    src="/assets/vahlay_astro.png"
                    alt="logo"
                    className=" bg-white w-14 h-14 object-contain rounded-full"
                  />
                </div>
                    {article.imageUrl && (
                      <img
                        src={article.imageUrl}
                        alt="Article"
                        className="w-full h-72 md:h-[350px]  object-cover rounded-md shadow-md"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    {/* Title with Truncation */}
                    
                    <h3
                      className="text-center text-base font-bold text-gray-700 sm:text-lg 
                         whitespace-nowrap overflow-hidden text-ellipsis block"
                      title={article.title} // Full title on hover
                    >
                      {article.title}
                    </h3>

                    {/* Description with Single Line & Truncation */}
                    
                    <p
                      className="text-sm text-gray-700 mb-4 
                         whitespace-nowrap overflow-hidden text-ellipsis block"
                      title={article.hindi} // Full text on hover
                    >
                      {article.hindi?.substring(0, 80)}...
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
        className="relative h-auto  bg-red-600 text-white lg:py-16 px-6 flex flex-col items-center text-center |lg:my-40 py-6 m-4"
        style={{
          backgroundImage: "url('/assets/wheel.png')", // Replace with your actual image path
          backgroundSize: "1500px", // Ensure the background covers the container
          backgroundPosition: "center", // Center the background image
          backgroundRepeat: "no-repeat", // Prevent repetition
          className: "mx-20",
        }}
      >


        {/* Content */}
        <div className="relative z-10 max-w-3xl ">
          <h2 className="  text-xl md:text-4xl text-orange-200 font-bold mb-4">
            Ready to Discover Your Path?
          </h2>
          <p className=" text-sm lg:text-lg text-gray-300 mb-8">
            Take the next step in your astrological journey with personalized guidance from our expert astrologers. Whether you’re seeking clarity on a specific life decision, curious about your birth chart, or looking for support during a challenging time, our consultations are designed to provide insight and direction.
          </p>
          <p className=" text-base  lg:text-lg text-gray-300 mb-8">Schedule your session today!</p>
          <Link to="/appointment">
            <button className="bg-white text-red-600 py-1 px-8 rounded-full hover:bg-red-700 hover:text-white transform hover:scale-105 transition duration-300">
              Book Now
            </button>
          </Link>
        </div>
      </div>



      {/* Consulting. */}
      <div className="bg-gray-50 py-6  md:py-16 px-6 lg:px-20 flex flex-col lg:flex-row items-center">
        {/* Text Section */}
        <div className="lg:w-3/4  my-10  lg:my-auto lg:pr-10 ">
          <h2 className="text-xl md:text-4xl font-bold text-red-600 mb-4">What We Do...</h2>
          <p className="text-gray-700 text-center lg:text-left text-sm lg:text-lg leading-relaxed mb-6">
            At...<strong> Vahlay Astro</strong>, we provide expert astrology consulting to guide you through life’s most pivotal decisions. Our personalized consultations offer deep insights into your birth chart, relationships, career, and life purpose, helping you navigate challenges and seize opportunities. With a focus on Vedic astrology, we empower you with actionable remedies and cosmic guidance to align with your true path. Our mission is to bring clarity, balance, and purpose to your journey, enabling you to make informed decisions and live a more fulfilling life.
          </p>
          <Link to={"/consulting"}>
            <button className="bg-red-600 text-white px-6 py-1 rounded-full font-semibold hover:bg-red-700">
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
        className="relative h-auto bg-red-600 text-white lg;py-16 px-6 flex flex-col items-center text-center m-4 "
        style={{
          backgroundImage: "url('/assets/wheel.png')", // Replace with your actual image path
          backgroundSize: "1500px", // Ensure the background covers the container
          backgroundPosition: "center", // Center the background image
          backgroundRepeat: "no-repeat", // Prevent repetition    
          className: "mx-20",
        }}
      >


        <div className="relative z-10 max-w-3xl ">
          <h2 className=" text-xl md:text-4xl font-bold lg:mb-4 text-orange-200">

            Happy Client Testimonials
          </h2>
        </div>
      </div>

{}
      {/* Grid Layout */}
        <div className="grid grid-cols-1 justify-center my-10 lg:my-20 m-4 ">
          {isMobile ? (
              <div className="h-[600px] overflow-hidden relative">
    <div className="animate-scroll-slow flex flex-col space-y-6">
      {[...testimonials, ...testimonials].map((testimonial, index) => (
        <div
          key={index}
          className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transform transition duration-300 hover:scale-105 ${
            index % 2 === 0
              ? "bg-red-600 text-white"
              : "bg-white text-gray-800 dark:bg-red-800 dark:text-white"
          }`}
          style={{ backgroundImage: "url('assets/cardbg-hp.png')" }}
        >
          <p
            className={`text-xs lg:text-sm ${
              index % 2 === 0 ? "text-white" : "text-gray-600 dark:text-gray-300"
            }`}
          >
            "{testimonial.quote}"
          </p>
          <div
            className={`flex justify-start gap-1 ${
              index % 2 === 0 ? "text-yellow-300" : "text-yellow-500"
            } mb-4`}
          >
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <span key={i}>&#9733;</span>
            ))}
          </div>
          <div className='flex flex-row items-center'> 
          
            <div>
          <h3
            className={`text-xl lg:text-2xl font-semibold ${
              index % 2 === 0 ? "text-white" : "text-gray-800 dark:text-white"
            }`}
          >
            {testimonial.name}
          </h3>
          <p
            className={`text-xs lg:text-sm mb-2 ${
              index % 2 === 0 ? "text-white" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {testimonial.title}
          </p>
          </div>
          </div>
          
        </div>
      ))}
    </div>
  </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 ">
              {[col1,col2,col3].map((col, colindex) => (

              <div
                  key={colindex}
                  className='h-[600px] overflow-hidden relative md:my'
              >
                  
                <div
                  key={colindex}
                  className={` flex flex-col  space-y-8 px-8    ${scrollSpeeds[colindex]}`}
                >
                  
                {[...col,...col].map((testimonial , index)=>(
                <div
                  key={index}
                  className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transform transition duration-300 hover:scale-105 ${index % 2 === 0
                    ? "bg-red-600 text-white "
                    : "bg-white text-gray-800 dark:bg-red-800 dark:text-white"
                    }`}
                  style={{ backgroundImage: "url('assets/cardbg-hp.png')" }}
                >
                  <p
                    className={`text-sm ${index % 2 === 0 ? "text-white" : "text-gray-600 dark:text-gray-300"
                      }`}
                  >
                    "{testimonial.quote}"
                  </p>

                  <div
                    className={`flex justify-start   gap-1 ${index % 2 === 0 ? "text-yellow-300" : "text-yellow-500"
                      } mb-4`}
                  >
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span className='font-extrabold text-lg' key={i}>&#9733;</span>
                    ))}
                  </div>
                <div className='flex flex-row items-center'> 
          
                  <div>
                  <h3
                    className={`text-xl font-semibold ${index % 2 === 0 ? "text-white" : "text-gray-800 dark:text-white"
                      }`}
                  >
                    {testimonial.name}
                  </h3>
                  <p
                    className={`text-sm mb-2 ${index % 2 === 0 ? "text-white" : "text-gray-500 dark:text-gray-400"
                      }`}
                  >
                    <strong>Course:- </strong>{testimonial.title}
                  </p>
                  </div>
                  </div>
                  
                
                </div>
                ))}
                </div>
                </div>
              ))}
            </div>
          )}
        </div>


      {/* Copartners Section */}

      <div className="flex flex-col items-center justify-center min-h-auto bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-8">
        {/* Header */}
        <h1 className="  text-xl md:text-4xl font-extrabold text-white mb-16 text-center">
          Our Partners
        </h1>

        {/* Display Swiper for mobile and grid for desktop */}
        {isMobile ? (
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
            className="w-full max-w-7xl"
          >
            {partners.map((partner, index) => (
              <SwiperSlide key={index}>
                <div className="relative flex flex-col items-center bg-white p-2 mb-8 rounded-3xl shadow-lg transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-red-400 via-red-500 to-red-600 blur-3xl opacity-20 rounded-3xl -z-10"></div>
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 border-4 border-red-500 rounded-full overflow-hidden transform hover:scale-110 transition-transform duration-300">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} Logo`}
                      className="object-contain w-40 h-auto lg:h-40"
                    />
                  </div>
                  <p className="mt-6 text-center text-base lg:text-lg font-bold text-red-600">
                    <a
                      href={partner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {partner.name}
                    </a>
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-7xl">
            {partners.map((partner, index) => (
              <div key={index} className="relative flex flex-col items-center bg-white p-8 rounded-3xl shadow-lg transform hover:scale-105 transition-transform duration-300 hover:shadow-2xl">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-red-400 via-red-500 to-red-600 blur-3xl opacity-20 rounded-3xl -z-10"></div>
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 border-4 border-red-500 rounded-full overflow-hidden transform hover:scale-110 transition-transform duration-300">
                  <img src={partner.logo} alt={`${partner.name} Logo`} className="object-contain w-40 h-40" />
                </div>
                <p className="mt-6 text-center text-lg font-bold text-red-600">
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

export default Home;




