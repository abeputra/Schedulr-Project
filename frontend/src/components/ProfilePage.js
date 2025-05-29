import React, { useState, useEffect } from "react";
import logo from "../assets/schedulr-logo-horizontal.png";
import {
  FaTachometerAlt,
  FaCalendar,
  FaUsers,
  FaFileAlt,
  FaClipboard,
  FaSignOutAlt,
} from "react-icons/fa";
import defaultProfileImage from "../assets/profile-photo-default.png";
import { useNavigate, Link } from "react-router-dom";

const ProfilePage = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [user, setUser] = useState({
    full_name: "",
    id: "",
    username: "",
  });

  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Waktu dan tanggal
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setTime(formattedTime);
      const formattedDate = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setDate(formattedDate);
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(tz.replace("_", " "));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsMenuOpen(!isMenuOpen);
  };

  // Tutup sidebar jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".sidebar") &&
        !event.target.closest(".navbar-brand")
      ) {
        setIsSidebarOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Fetch user data dari token
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Failed to fetch user:", errorData);
          if (res.status === 401) {
            // Jika token expired atau invalid, redirect ke login
            navigate("/login");
          }
          return;
        }

        const data = await res.json();
        console.log("Fetched user:", data);
        setUser(data);
      } catch (err) {
        console.error("Fetch failed:", err.message);
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isSidebarOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "400px",
          height: "100%",
          backgroundColor: "#0D1A2A",
          color: "white",
          transition: "transform 0.3s ease",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          paddingTop: "5rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img src={logo} alt="Schedulr Logo" style={{ width: "80%" }} />
        </div>

        <div
          style={{
            fontSize: "1.2rem",
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            textAlign: "left",
          }}
        >
          <ul style={{ paddingLeft: "5rem" }}>
            <li style={{ marginBottom: "1.5rem" }}>
              <Link
                to="/dashboard"
                style={{ color: "white", textDecoration: "none" }}
              >
                <FaTachometerAlt style={{ marginRight: "1rem" }} />
                Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: "1.5rem" }}>
              <Link
                to="/events"
                style={{ color: "white", textDecoration: "none" }}
              >
                <FaCalendar style={{ marginRight: "1rem" }} />
                Events
              </Link>
            </li>
            <li style={{ marginBottom: "1.5rem" }}>
              <Link
                to="/teams"
                style={{ color: "white", textDecoration: "none" }}
              >
                <FaUsers style={{ marginRight: "1rem" }} />
                Teams
              </Link>
            </li>
            <li style={{ marginBottom: "1.5rem" }}>
              <Link
                to="/plans"
                style={{ color: "white", textDecoration: "none" }}
              >
                <FaFileAlt style={{ marginRight: "1rem" }} />
                Plans
              </Link>
            </li>
            <li style={{ marginBottom: "1.5rem" }}>
              <Link
                to="/summary"
                style={{ color: "white", textDecoration: "none" }}
              >
                <FaClipboard style={{ marginRight: "1rem" }} />
                Summary
              </Link>
            </li>
            <li>
              <Link
                to="/"
                onClick={() => localStorage.removeItem("token")}
                style={{ color: "white", textDecoration: "none" }}
              >
                <FaSignOutAlt style={{ marginRight: "1rem" }} />
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <nav
        className="navbar has-text-white px-5 py-2"
        role="navigation"
        style={{
          backgroundColor: "#0D1A2A",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 400,
        }}
      >
        <div
          className="container is-flex is-align-items-center is-justify-content-space-between"
          style={{ gap: "1rem" }}
        >
          {/* Hamburger Menu Button */}
          <div
            className="navbar-brand"
            style={{
              marginRight: "1rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "24px",
              width: "30px",
              transition: "0.3s", // Smooth transition for changes
            }}
            onClick={toggleSidebar} // Toggle the sidebar when clicked
          >
            {/* Three lines for hamburger menu with animation */}
            <div
              style={{
                width: "30px",
                height: "4px",
                backgroundColor: "white",
                margin: "-0.5", // Reduced margin between lines
                transition: "0.3s", // Transition for animation
                transform: isMenuOpen
                  ? "rotate(90deg) translateY(8px)"
                  : "none", // Rotate first line when clicked
              }}
            ></div>
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "white",
                margin: "-0.5", // Reduced margin between lines
                transition: "0.3s", // Transition for animation
                opacity: isMenuOpen ? "0" : "1", // Hide the middle line when clicked
              }}
            ></div>
            <div
              style={{
                width: "30px",
                height: "4px",
                backgroundColor: "white",
                margin: "0", // Reduced margin between lines
                transition: "0.3s", // Transition for animation
                transform: isMenuOpen
                  ? "rotate(-90deg) translateY(-8px)"
                  : "none", // Rotate the third line when clicked
              }}
            ></div>
          </div>

          {/* Logo */}
          <div className="navbar-brand">
            <img
              src={logo}
              alt="Schedulr Logo"
              className="object-contain"
              style={{ width: "clamp(200px, 20vw, 300px)" }}
            />
          </div>

          {/* Date, Time, Timezone & Search Bar */}
          <div
            className="is-flex is-align-items-center"
            style={{
              gap: "1.5rem",
              flexGrow: 1,
              justifyContent: "flex-end",
              fontWeight: 600,
              fontSize: "clamp(0.5rem, 2vw, 1rem)", // Responsive font size
            }}
          >
            <div>
              <div style={{ paddingLeft: "1.3rem" }}>{date}</div>
              <div>
                {time}
                <span
                  style={{
                    marginLeft: "0.5rem",
                    fontWeight: 600,
                    color: "white",
                    fontSize: "clamp(0.5rem, 2vw, 1rem)", // Smaller but responsive
                  }}
                >
                  ({timezone})
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div
              className="control"
              style={{ maxWidth: "200px", width: "100%" }}
            >
              <input
                className="input is-rounded"
                type="text"
                placeholder="Search something..."
                style={{
                  fontWeight: 400,
                  fontSize: "clamp(0.5rem, 2vw, 1rem)", // Responsive input font
                  color: "white", // Set text color to white
                  backgroundColor: "#0D1A2A", // Set background color to make input visible (optional, adjust as needed)
                  border: "2px solid white", // Border color to make it visible
                }}
              />
            </div>

            {/* Profile Picture */}
            <a
              href="/profile" // Link to the profile page
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid white",
                marginLeft: "0rem",
                display: "inline-block", // Ensures the container behaves like a block element but doesn't disturb the layout
              }}
            >
              <img
                src={profileImage || defaultProfileImage}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </a>
          </div>
        </div>
      </nav>

      {/* Profile Section */}
      <div
        style={{
          backgroundColor: "#0D1A2A",
          padding: "50px",
          margin: "50px 250px",
          borderRadius: "20px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "0px",
              left: "60px",
              width: "300px",
              height: "300px",
              overflow: "hidden",
              borderRadius: "20px",
            }}
          >
            <img
              src={profileImage || defaultProfileImage}
              alt="Profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ marginLeft: "400px" }}>
            <h2
              style={{
                fontSize: "60px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                letterSpacing: "1px",
                color: "#FFFFFF",
              }}
            >
              {user.full_name || "Loading name..."}
            </h2>
            <div
              style={{
                fontSize: "18px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                color: "#FFFFFF",
              }}
            >
              ID{" "}
              {user.id
                ? `${user.id} • @${user.username}`
                : "Loading user info..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
