
import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Page Components
import Home from './components/pages/Home';
import About from './components/pages/About';
import SignUp from './components/joinus/SignUp';
import Login from './components/joinus/Login';
import Forgetpassword from './components/joinus/ForgetPassword';
import Appointment from './components/pages/Appointment';
import NewUser from './components/pages/NewUser';
import OldUser from './components/pages/OldUser';
import SuccessPage from './components/pages/SuccessPage';
import ContactUs from './components/pages/ContactUs';
import Courses from './components/pages/Courses';
import CourseDetail from './components/pages/CourseDetail';
import Enroll from './components/pages/Enroll';
import Services from './components/pages/Services';
import Consulting from './components/pages/Consulting';
import Blogs from './components/pages/Blogs';
import Paidcourse1 from './components/pages/courses/Paidcourse1';
import BhagavadGita from './components/pages/courses/BhagavadGita';
import Narad from './components/pages/courses/Narad';
import EnrollFree from './components/pages/EnrollFree';
import Dashboard from './components/pages/Dashboard';
import Profile from './components/pages/Profile';
import EnrolledCourses from './components/pages/EnrolledCourses';
import AddCourse from './components/pages/AddCourse';
import Calendar from './components/pages/Calender';
import Calendar2 from './components/pages/Calender2';
import Admin from './components/pages/Admin';
import Upload from './components/pages/Upload';
import Copartners from './components/pages/Copartners'
import AddModule from "./components/pages/AddModule"
import AdminLiveSession from "./components/pages/LiveSession/Adminlivesession";
import StudentLiveSession from "./components/pages/LiveSession/StudentLiveSession";
import Startleraning from './components/pages/Startleraning';
import JitsiIframe from './components/pages/LiveSession/JitsiIframe';
import AddMeeting from "./components/pages/AddMeeting";
import VedioDetail from "./components/pages/VedioDetail";
import PaymentGuide from './components/pages/PaymentGuide';

import AdminCourseOrder from './components/pages/AdminCourseOrder';


import ProtectedRoutes from "./components/pages/ProtectedRoutes"
import AdminCalendar from './components/pages/AdminCalendar';
import AdminArticle from './components/pages/AdminArticle';
import Unauthorized from './components/pages/Unauthorized';
import AdminQuestion from './components/pages/AdminQuestion';
import SecurityGuard from './components/pages/SecurityGuard';





// Emi

import Notifications from './components/Emi/Notification';
import AddEmi from "./components/Emi/AddEmi"
import Finalize from "./components/Emi/Finalize";
import EmiUserList from "./components/Emi/EmiUserList";
import EMIDetails from './components/Emi/EmiDetails';
import PayEmi from "./components/Emi/PayEmi"



// Article Components
import ArticlePage1 from './components/pages/Articles/Article1';
import Payment from "./components/pages/Payment"



// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// CSS Imports
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import AdminArticles from './components/pages/AdminArticle';
import AdminSubscribeCourseList from "./components/pages/AdminSubscribeCourseList"
import AdminInquiries from './components/pages/AdminInquiry';

import ScrollToTop from "./components/pages/ScrollTop";
import AdminContact from './components/pages/AdminContact';
import QuestionAndAns from './components/pages/QuestionAndAns';
import AdminVedioOrder from "./components/pages/AdminVedioOrder"

import LanguageSelector from './components/LanguageSelector';
import AdminTitleArrange from "./components/pages/AdminTitleArrange"



const App = () => {


  return (
    <Router>
      {/* <SecurityGuard /> */}
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <ScrollToTop />
        <main className="flex-grow pt-0 px-4 md:px-0">
          <Routes>
            {/* General Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgetpassword" element={<Forgetpassword />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/newuser" element={<ProtectedRoutes  ><NewUser /></ProtectedRoutes>} />
            <Route path="/olduser" element={<ProtectedRoutes><OldUser /></ProtectedRoutes>} />
            <Route path="/submission-success" element={<ProtectedRoutes><SuccessPage /></ProtectedRoutes>} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/copartners" element={<Copartners />} />
            <Route path="/paymentguide" element={<PaymentGuide />} />


            {/* Course Routes */}
            <Route path="/courses" element={<Courses />} />


            {/* <Route path="/coursedetail/:id" element={<CourseDetail />} /> */}
            <Route path="/coursedetail/:courseId/:courseType" element={<ProtectedRoutes><CourseDetail /></ProtectedRoutes>} />



            {/* <Route path="/enroll" element={<Enroll />} /> */}
            <Route path="/paidcourse1" element={<ProtectedRoutes><Paidcourse1 /></ProtectedRoutes>} />
            <Route path="/bhagavadgita" element={<ProtectedRoutes><BhagavadGita /></ProtectedRoutes>} />
            <Route path="/narad" element={<ProtectedRoutes><Narad /></ProtectedRoutes>} />
            {/* <Route path="/enrollfree" element={<EnrollFree />} /> */}

            {/* Services and Blogs */}
            <Route path="/services" element={<Services />} />
            <Route path="/consulting" element={<Consulting />} />
            <Route path="/articles" element={<Blogs />} />

            {/* Calendar Routes */}
            <Route path="/calendar" element={<ProtectedRoutes><Calendar /></ProtectedRoutes>} />
            <Route path="/calendar2" element={<ProtectedRoutes><Calendar2 /></ProtectedRoutes>} />

            {/* Article Routes */}
            <Route path="/article/:id" element={<ArticlePage1 />} />

            {/* Admin and Dashboard */}
            {/* <Route path="/admin" element={<Admin />} /> */}

            <Route path="/admin/admincourseorder" element={<ProtectedRoutes adminOnly={true}>  <AdminCourseOrder /></ProtectedRoutes>} />

            <Route path="/admin/addcourse" element={
              <ProtectedRoutes adminOnly={true} >
                <AddCourse />
              </ProtectedRoutes>
            } />
            <Route path="/dashboard" element={

              <ProtectedRoutes> <Dashboard /> </ProtectedRoutes>} />
            <Route path="/profile" element={<ProtectedRoutes>
              <Profile />
            </ProtectedRoutes>} />
            <Route path="/enrolledcourse" element={<ProtectedRoutes>
              <EnrolledCourses /></ProtectedRoutes>
            } />
            <Route path="/admin/addmeeting" element={
              <ProtectedRoutes adminOnly={true} >
                <AddMeeting />
              </ProtectedRoutes>
            } />

            <Route path="/admin/question-ans" element={
              <ProtectedRoutes adminOnly={true} >
                <AdminQuestion />
              </ProtectedRoutes>
            } />

            <Route
              path="/admin/question-answer"
              element={
                <ProtectedRoutes adminOnly={true} >
                  <QuestionAndAns />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/course/:courseName/video/:videoId"
              element={
                <ProtectedRoutes>
                  <VedioDetail />
                </ProtectedRoutes>
              }
            />


            {/* <Route path="/meet" element={<Meet />} /> */}
            <Route path="/course/:courseName" element={<ProtectedRoutes><Startleraning /> </ProtectedRoutes>}></Route>
            <Route path="/admin/upload" element={
              <ProtectedRoutes adminOnly={true} >
                <Upload />
              </ProtectedRoutes>
            } />
            <Route path="/admin/addmodule" element={
              <ProtectedRoutes adminOnly={true} >
                <AddModule />
              </ProtectedRoutes>
            } />
            <Route path="/admin/adminlivesession" element={
              <ProtectedRoutes adminOnly={true} >
                <AdminLiveSession />
              </ProtectedRoutes>
            } />


            <Route path="/admin/vedio-order" element={
              <ProtectedRoutes adminOnly={true} >
                <AdminVedioOrder />
              </ProtectedRoutes>
            } />


            <Route path="/admin/title-order" element={
              <ProtectedRoutes adminOnly={true} >
                <AdminTitleArrange />
              </ProtectedRoutes>
            } />

            <Route path="/studentlivesession" element={<ProtectedRoutes><StudentLiveSession /> </ProtectedRoutes>} />
            <Route path="/JitsiIframe" element={<ProtectedRoutes><JitsiIframe /> </ProtectedRoutes>} />


            <Route
              path="/enroll/:courseId/:courseType"
              element={
                <ProtectedRoutes>
                  <Enroll />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/enrollfree"
              element={
                <ProtectedRoutes  >
                  <EnrollFree />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <AdminArticle />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/admin/payment"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <Payment />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/adminsubscribecourselist"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <AdminSubscribeCourseList />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/admininquiry"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <AdminInquiries />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/adminarticle"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <AdminArticles />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/admincalendar"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <AdminCalendar />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/admincontact"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <AdminContact />
                </ProtectedRoutes>
              }
            />
            <Route path="/admin/addemi" element={
              <ProtectedRoutes adminOnly={true} >
                <AddEmi />
              </ProtectedRoutes>
            } />
            <Route path="/admin/emailuserlist" element={
              <ProtectedRoutes adminOnly={true}>
                <EmiUserList />
              </ProtectedRoutes>
            } />
            <Route path="admin/emailuserlist/:email" element={<ProtectedRoutes adminOnly={true} > <EMIDetails /></ProtectedRoutes>} />
            <Route path="/payemi" element={<ProtectedRoutes> <PayEmi /> </ProtectedRoutes>} />
            <Route path="/finalize" element={<ProtectedRoutes> <Finalize />  </ProtectedRoutes>} />
            <Route path="/notifications" element={<Notifications />} />

            <Route path="/unauthorized" element={<Unauthorized />} />

          </Routes>
        </main>
        <Footer />
        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/918849092183?text=Hello%2C%20I%20have%20a%20question%20about%20the%20course"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="h-10 w-10"
            fill="currentColor"
          >
            <path
              d="M16.001 3.001c-7.171 0-13 5.828-13 13 0 2.3.609 4.45 1.672 6.322L3 29l7.002-1.64a12.85 12.85 0 005.999 1.462c7.171 0 13-5.828 13-13s-5.829-13-13-13zm0 2c6.065 0 11 4.934 11 11s-4.935 11-11 11c-1.995 0-3.871-.527-5.513-1.446l-.393-.225-4.156.974.923-4.084-.23-.388C5.671 19.327 5 17.248 5 16.001c0-6.065 4.934-11 11-11zm-4.439 4.74c-.317-.007-.702.002-1.064.247-.305.207-.994.974-1.13 1.835-.136.861-.278 1.891.634 3.304s2.81 4.366 6.145 5.497c1.792.623 2.653.535 3.599.4.946-.134 1.73-.757 1.978-1.49.247-.733.247-1.34.175-1.49-.072-.15-.278-.217-.583-.38s-1.73-.853-2.001-.95c-.27-.097-.465-.144-.659.144-.195.289-.758.95-.93 1.144-.172.195-.343.217-.634.073-.291-.144-1.23-.453-2.342-1.448-.865-.772-1.448-1.726-1.614-2.017-.167-.289-.018-.446.126-.594.13-.13.29-.342.437-.512.145-.17.195-.29.291-.486.096-.195.048-.365-.024-.512s-.658-1.64-.899-2.242c-.216-.527-.437-.545-.634-.55z"
            />
          </svg>
        </a>
      </div>
    </Router>
  );
};

export default App;



