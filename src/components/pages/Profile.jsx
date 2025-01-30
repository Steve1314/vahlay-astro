
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../firebaseConfig"; // Firebase configuration file
 
const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    profilePic: "",
    fullName: "NA",
    fathersName: "NA",
    mothersName: "NA",
    dob: "NA",
    email: "NA",
  });
  const [imageFile, setImageFile] = useState(null); // State for uploaded image
  const [loading, setLoading] = useState(true); // Loading state to prevent flickering
  const db = getFirestore(app);
 
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
 
    if (currentUser) {
      setUser(currentUser);
 
      // Fetch user profile from Firestore
      const fetchProfile = async () => {
        const userDocRef = doc(db, "students", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
 
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            profilePic: userData.profilePic || "",
            fullName: userData.fullName || "NA",
            fathersName: userData.fathersName || "NA",
            mothersName: userData.mothersName || "NA",
            dob: userData.dob || "NA",
            email: currentUser.email || "NA",
          });
        } else {
          // If user profile doesn't exist, set default values
          setFormData({
            profilePic: "",
            fullName: "NA",
            fathersName: "NA",
            mothersName: "NA",
            dob: "NA",
            email: currentUser.email || "NA",
          });
        }
 
        setLoading(false); // Set loading to false once the profile is fetched
      };
 
      fetchProfile();
    } else {
      setLoading(false); // In case no user is logged in, stop loading
    }
  }, [db]); // Dependency array ensures it only runs once on mount
 
  const handleEdit = () => {
    setIsEditing(true);
  };
 
  const handleCancel = () => {
    setIsEditing(false);
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
 
  const handleSave = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
 
    if (currentUser) {
      try {
        let imageUrl = formData.profilePic;
 
        // If a new profile picture is uploaded
        if (imageFile) {
          const storage = getStorage();
          const storageRef = ref(storage, `profile-pics/${currentUser.uid}`);
         
          // Upload the image
          await uploadBytes(storageRef, imageFile);
         
          // Get the download URL after upload
          imageUrl = await getDownloadURL(storageRef);
        }
 
        // Save profile data with the image URL to Firestore
        const userDocRef = doc(db, "students", currentUser.uid);
        await setDoc(userDocRef, {
          ...formData,
          profilePic: imageUrl,  // Save the URL from Firebase Storage
        });
 
        alert("Profile updated successfully!");
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile.");
      }
    }
  };
 
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
        <div className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-4xl p-4 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="flex h-screen min-h-screen">
      <aside
        className={`w-64 bg-red-600 text-white p-4 shadow-lg transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative h-full z-10`}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-2xl font-bold"
          >
            ✖
          </button>
        </div>
        <div className="p-6 flex flex-col items-center">
          <img
            src={formData.profilePic || "https://via.placeholder.com/100"}
            alt="Profile"
            className="rounded-full mb-4"
          />
          <h2 className="text-lg font-bold">{user?.displayName || "User"}</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link
                to="/profile"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                Enrolled Courses
              </Link>
            </li>
            <li>
              <Link
                to="/courses"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                Add Courses
              </Link>
            </li>
            <li>
              <Link
                to="/finalize"
                className="block p-3 bg-red-500 hover:bg-red-400 rounded transition"
              >
                Payments

              </Link>
            </li>

          </ul>
        </nav>
      </aside>
 
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden bg-red-500 text-white p-2 rounded flex items-center mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
 
        <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 text-white rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center">Student Profile</h2>
        </div>
 
        {user ? (
          <div className="p-6">
            {isEditing ? (
              <form className="space-y-10">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <label className="text-sm font-medium text-gray-700">Profile Picture</label>
                  <input
                    type="file"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="mt-2 w-full max-w-md py-2 px-4 rounded border border-gray-300 focus:ring-2 focus:ring-red-500"
                  />
                  {imageFile && (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Profile Preview"
                      className="w-24 h-24 rounded-full mt-4 object-cover shadow-lg"
                    />
                  )}
                </div>
 
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full py-2 px-4 rounded border border-gray-300 focus:ring-2 focus:ring-red-500"
                  />
                </div>
 
                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                  <input
                    type="text"
                    name="fathersName"
                    value={formData.fathersName}
                    onChange={handleChange}
                    className="w-full py-2 px-4 rounded border border-gray-300 focus:ring-2 focus:ring-red-500"
                  />
                </div>
 
                {/* Mother's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                  <input
                    type="text"
                    name="mothersName"
                    value={formData.mothersName}
                    onChange={handleChange}
                    className="w-full py-2 px-4 rounded border border-gray-300 focus:ring-2 focus:ring-red-500"
                  />
                </div>
 
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob !== "NA" ? formData.dob : ""}
                    onChange={handleChange}
                    className="w-full py-2 px-4 rounded border border-gray-300 focus:ring-2 focus:ring-red-500"
                  />
                </div>
 
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-10">
                <div className="flex justify-center">
                  {formData.profilePic ? (
                    <img
                      src={formData.profilePic}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-md object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-md bg-gray-300 flex items-center justify-center text-white">
                      No Image
                    </div>
                  )}
                </div>
                <p>
                  <strong>Full Name:</strong> {formData.fullName}
                </p>
                <p>
                  <strong>Father's Name:</strong> {formData.fathersName}
                </p>
                <p>
                  <strong>Mother's Name:</strong> {formData.mothersName}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {formData.dob}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
      </main>
    </div>
  );
};
 
export default Profile;
 


