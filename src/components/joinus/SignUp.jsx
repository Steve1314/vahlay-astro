import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {  signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import zxcvbn from "zxcvbn"; // Install with npm install zxcvbn
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";


const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);


  const navigate = useNavigate();


  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
 

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };


  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handlePasswordChange = (password) => {
    setPassword(password);
    const passwordEvaluation = zxcvbn(password);
    setPasswordScore(passwordEvaluation.score);
  };

  const handleSignUp = async () => {
    setError("");

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Ensure username is not empty
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    // Check if password is strong enough
    if (passwordScore < 3) {
      setError("Password is too weak. Please choose a stronger password.");
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Ensure Terms and Conditions are accepted
    if (!acceptedTerms) {
      setError("You must accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with username
      await updateProfile(user, {
        displayName: username,
      });

      // Send email verification
      await sendEmailVerification(user);

      alert("Sign-up successful! Please check your email for verification.");
      navigate("/login");
    } catch (error) {
      setError("Failed to sign up. " + error.message);
    }
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value); // Store the value of the reCAPTCHA
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-backgroundImage">
      <div className="bg-black bg-opacity-60 p-8 rounded-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-white mb-6">Sign Up</h2>

        {/* Username Input */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {/* Password Input */}
        <div className="relative mb-4">
          <span
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-white cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="w-full py-2 pl-10 pr-3 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Password Strength Meter */}
        <div className="flex items-center mb-4">
          <div className="flex-1 bg-gray-300 h-2 rounded">
            <div
              className={`h-full rounded ${passwordScore >= 3 ? "bg-green-500" : "bg-red-500"}`}
              style={{ width: `${(passwordScore + 1) * 20}%` }}
            ></div>
          </div>
          <span className="ml-2 text-green-500 text-sm">
            {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordScore]}
          </span>
        </div>

        {/* Confirm Password Input */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full py-2 mb-4 px-4 rounded-full bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Terms and Conditions */}
        <div className="mb-4">
          <label className="flex items-center text-gray-300">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={() => setAcceptedTerms(!acceptedTerms)}
              className="form-checkbox h-4 w-4 text-red-500"
            />
            <span className="ml-2">
              I agree to the <a href="/terms" className="underline text-white">Terms of Service</a> and <a href="/privacy" className="underline text-white">Privacy Policy</a>.
            </span>
          </label>
        </div>

        <ReCAPTCHA
          sitekey={recaptchaSiteKey}
          onChange={handleRecaptchaChange}
        />

        <button
          onClick={handleSignUp}
          className="w-full py-2 mt-4 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600"
          disabled={!acceptedTerms} // Disable if terms are not accepted
        >
          Sign Up
        </button>
        <button
          onClick={handleGoogleLogin}
          className={`w-full py-2 mt-4 font-semibold rounded-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
          disabled={loading}
        >
          {loading ? "Logging In..." : "Sign In with Google"}
        </button>
        <p className="text-center text-gray-300 mt-4">
          If you already have an account | <Link to="/login">LogIn</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
