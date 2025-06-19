import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from "../../firebaseConfig"; // Import initialized Firebase
import { logEvent } from "firebase/analytics";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    logEvent(analytics, "page_view", {
      page_path: location.pathname,
      page_title: document.title,
    });
  }, [location]);

  return null;
};



export default AnalyticsTracker;
