// src/App.js
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
import AddMeeting from "./components/pages/AddMeeting"


import ProtectedRoutes from "./components/pages/ProtectedRoutes"
import AdminCalendar from './components/pages/AdminCalendar';
import AdminArticle from './components/pages/AdminArticle';
import Unauthorized from './components/pages/Unauthorized';




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

import ScrollToTop from "./components/pages/ScrollTop";



const App = () => {

return (
    <Router>
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
            <Route path="/newuser" element={<NewUser />} />
            <Route path="/olduser" element={<OldUser />} />
            <Route path="/submission-success" element={<SuccessPage />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/copartners" element={<Copartners />} />

            {/* Course Routes */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/coursedetail/:id" element={<CourseDetail />} />
            {/* <Route path="/enroll" element={<Enroll />} /> */}
            <Route path="/paidcourse1" element={<Paidcourse1 />} />
            <Route path="/bhagavadgita" element={<BhagavadGita />} />
            <Route path="/narad" element={<Narad />} />
            {/* <Route path="/enrollfree" element={<EnrollFree />} /> */}

            {/* Services and Blogs */}
            <Route path="/services" element={<Services />} />
            <Route path="/consulting" element={<Consulting />} />
            <Route path="/articles" element={<Blogs />} />

            {/* Calendar Routes */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/calendar2" element={<Calendar2 />} />

            {/* Article Routes */}
            <Route path="/article/:id" element={<ArticlePage1 />} />

            {/* Admin and Dashboard */}
            {/* <Route path="/admin" element={<Admin />} /> */}
            <Route path="/addcourse" element={
              <ProtectedRoutes adminOnly={true} >
                <AddCourse />
              </ProtectedRoutes>
            } />
            <Route path="/dashboard" element={

               <Dashboard />

            } />
            <Route path="/profile" element={
              <Profile />
            } />
            <Route path="/enrolledcourse" element={
              <EnrolledCourses />
            } />
            <Route path="/addmeeting" element={
              <ProtectedRoutes adminOnly={true} >
                <AddMeeting />
              </ProtectedRoutes>
            } />


            {/* <Route path="/meet" element={<Meet />} /> */}
            <Route path="/course/:courseName" element={<Startleraning />}></Route>
            <Route path="/upload" element={
              <ProtectedRoutes adminOnly={true} >
                <Upload />
              </ProtectedRoutes>
            } />
            <Route path="/addmodule" element={
              <ProtectedRoutes adminOnly={true} >
                <AddModule />
              </ProtectedRoutes>
            } />
            <Route path="/adminlivesession" element={
              <ProtectedRoutes adminOnly={true} >
                <AdminLiveSession />
              </ProtectedRoutes>
            } />
            <Route path="/studentlivesession" element={<StudentLiveSession />} />
            <Route path="/JitsiIframe" element={<JitsiIframe />} />




            {/* Protected route */}
            <Route
              path="/enroll"
              element={
                <ProtectedRoutes  >
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
              path="/payment"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <Payment />
                </ProtectedRoutes>
              }
            />



            <Route
              path="/adminsubscribecourselist"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <AdminSubscribeCourseList />
                </ProtectedRoutes>
              }
            />


            {/* <Route
  path="/unauthorized"
  element={<Unauthorized />} // Create an Unauthorized component to handle this case
/> */}

            <Route
              path="/adminarticle"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <AdminArticles />
                </ProtectedRoutes>
              }
            />

            <Route
              path="/admincalendar"
              element={
                <ProtectedRoutes adminOnly={true}>
                  <AdminCalendar />
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
            <Route path="admin/emailuserlist/:email" element={

              <EMIDetails />} />




            <Route path="/payemi" element={

              <PayEmi />

            } />
            <Route path="/finalize" element={

              <Finalize />

            } />
            <Route path="/notifications" element={


              <Notifications />


            } />


            <Route path="/unauthorized" element={<Unauthorized />} />



          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
