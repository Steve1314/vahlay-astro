import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);


  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
 

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateInputs = () => {
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    return true;
  };


  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
  
    if (!validateInputs()) return;
  
    if (!recaptchaValue) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }
  
    setLoading(true);
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Debugging log
  
      // Check if email is verified
      if (!user.emailVerified) {
        setError("Please verify your email address before logging in.");
        setLoading(false);
        return;
      }
  
      // Fetch all user documents from the Firestore collection
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
  
      let isAdminUser = false;
  
      // Loop through documents and check for admin status
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === email && userData.isAdmin) {
          isAdminUser = true;
        }
      });
  
      if (isAdminUser) {
        alert("Welcome Admin!");
        navigate("/admin"); // Redirect admin to admin portal
      } else {
        alert("Login successful!");
        navigate("/courses"); // Redirect normal users
      }
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  



  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError(""); // Clear any previous errors
  
    try {
      // Trigger Google sign-in
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Navigate to the home page after successful login
      alert(`Welcome, ${user.displayName}!`);
      navigate('/Home');
    } catch (error) {
      setError("Failed to log in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value); // Store the value of the reCAPTCHA
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-backgroundImage">
      <div className="bg-black bg-opacity-60 p-8 rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6">Log In</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Email"
        />
        <div className="relative mb-4">
          <span
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-white cursor-pointer"
            onClick={togglePasswordVisibility}
            aria-pressed={showPassword}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-2 pl-10 pr-3 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Password"
          />
        </div>

        <ReCAPTCHA
          sitekey={recaptchaSiteKey}
          onChange={handleRecaptchaChange}
        />

        <button
          onClick={handleEmailLogin}
          className={`w-full py-2 mt-4 font-semibold rounded-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
          disabled={loading}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <p className="text-center text-gray-300 mt-4">
          Don't have an account? {' '}
          <Link to="/signup" className="text-white underline">
           
           Sign Up
          </Link>
        </p>

        <p className="text-center text-gray-300 mt-4">
          <Link to="/forgetpassword" className="text-white underline">
            Forget Password?
          </Link>
        </p>

        <button
          onClick={handleGoogleLogin}
          className={`w-full py-2 mt-4 font-semibold rounded-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
          disabled={loading}
        >
          {loading ? "Logging In..." : "Sign In with Google"}
        </button>
      </div>
    </div>
  );
};

export default Login;
