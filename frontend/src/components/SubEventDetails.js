import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import logo from "../assets/schedulr-logo-horizontal.png";
import {
  FaTachometerAlt,
  FaPlus,
  FaCalendar,
  FaUsers,
  FaFileAlt,
  FaClipboard,
  FaSignOutAlt,
} from "react-icons/fa"; // Importing relevant icons
import defaultProfileImage from "../assets/profile-photo-default.png";
import "bulma/css/bulma.min.css"; // pastikan Bulma diimport

const SubEventDetails = () => {
  const { eventId } = useParams();
  const [subEvents, setSubEvents] = useState([]);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling the hamburger animation
  const [profileImage, setProfileImage] = useState(null); // State for the user's profile image
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the profile page
  };

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

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsMenuOpen(!isMenuOpen); // Toggle hamburger icon animation
  };

  // Close the sidebar if clicked outside
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

  useEffect(() => {
    const fetchSubEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token not found. Please login first.");
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/subevents/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setSubEvents(Array.isArray(data) ? data : data.subEvents);
      } catch (error) {
        console.error("Error fetching sub-events:", error);
      }
    };

    fetchSubEvents();
  }, [eventId]);

  const handleAddSubEvent = () => {
    navigate(`/details/${eventId}`);
  };

  const handleSubEventClick = (subeventId) => {
    navigate(`/subevents/detail/${subeventId}`);
  };

  const handleDeleteSubEvent = async (subeventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sub-event?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/subevents/${subeventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setSubEvents((prev) => prev.filter((s) => s.id !== subeventId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete sub-event");
      }
    } catch (error) {
      console.error("Error deleting sub-event:", error);
    }
  };

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
      {" "}
      {/* Apply white background here */}
      {/* Overlay (Dim effect) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)} // Close the sidebar when the overlay is clicked
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent dark background
            zIndex: 999, // Ensure the overlay is above other content
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
          width: "400px", // Increased the width to 300px
          height: "100%",
          backgroundColor: "#0D1A2A",
          color: "white",
          transition: "transform 0.3s ease",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          paddingTop: "5rem", // Add some space at the top to avoid being too close
        }}
      >
        {/* Logo at the top of the sidebar */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img
            src={logo}
            alt="Schedulr Logo"
            style={{ width: "80%", marginBottom: "1rem" }}
          />
        </div>

        {/* Sidebar Menu Items with Icons */}
        <div
          style={{
            fontSize: "1.2rem",
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            textAlign: "left",
          }}
        >
          <ul style={{ paddingLeft: "5rem" }}>
            {" "}
            {/* Add padding-left to the ul */}
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
      <div>
        <h1
          style={{
            color: "#0D1A2A",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: "bold",
            fontSize: "2rem",
            marginTop: "2rem",
            letterSpacing: "0.05em",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          Sub Event Information
        </h1>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleAddSubEvent}
            style={{
              backgroundColor: "#0D1A2A",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "15px",
              fontWeight: "bold",
              fontSize: "2rem",
              cursor: "pointer",
              border: "none",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            + Add New Sub Event
          </button>
        </div>

        <div className="container mt-5">
          {Array.isArray(subEvents) && subEvents.length > 0 ? (
            <div className="columns is-multiline">
              {subEvents.map((subEvent) => (
                <div className="column is-4" key={subEvent.id}>
                  <div className="card">
                    <div
                      className="card-content"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSubEventClick(subEvent.id)}
                    >
                      <p
                        className="title is-5"
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "bold",
                          fontSize: "1.5rem",
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em",
                          marginBottom: "1rem",
                        }}
                      >
                        {subEvent.title}
                      </p>
                      <p
                        className="subtitle is-6"
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em",
                          marginBottom: "2rem",
                        }}
                      >
                        {" "}
                        Organized by {subEvent.organizer || "Unknown"}
                      </p>
                      <p
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "normal",
                          fontSize: "1rem",
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Description
                        <span style={{ marginLeft: "7.2rem" }}>
                          : {subEvent.description}
                        </span>
                      </p>
                      <p
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "normal",
                          fontSize: "1rem",
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Additional Description{" "}
                        <span style={{ marginLeft: "1rem" }}>
                          : {subEvent.additional_description}
                        </span>
                      </p>
                      <p
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "normal",
                          fontSize: "1rem",
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Date{" "}
                        <span style={{ marginLeft: "10.5rem" }}>
                          : {subEvent.date}
                        </span>
                      </p>
                      <p
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "normal",
                          fontSize: "1rem",
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Time:{" "}
                        <span style={{ marginLeft: "10.2rem" }}>
                          : {subEvent.time}
                        </span>
                      </p>
                      <p
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "normal",
                          fontSize: "1rem",
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Location:{" "}
                        <span style={{ marginLeft: "8.1rem" }}>
                          : {subEvent.location}
                        </span>
                      </p>
                      <p
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "normal",
                          fontSize: "1rem",
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Event Type:{" "}
                        <span style={{ marginLeft: "6.9rem" }}>
                          : {subEvent.task_or_agenda}
                        </span>
                      </p>
                    </div>

                    {/* Tombol Delete yang diperbaiki */}
                    <footer className="card-footer">
                      <div className="card-footer-item">
                        <button
                          style={{
                            backgroundColor: "#A80000",
                            color: "#FFFFFF",
                          }}
                          onClick={() => handleDeleteSubEvent(subEvent.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#DB0101";
                            e.currentTarget.style.color = "#000000"; // misalnya jadi kuning saat hover
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#A80000";
                            e.currentTarget.style.color = "#FFFFFF"; // kembali ke putih
                          }}
                          className="button is-danger is-light is-fullwidth"
                        >
                          Delete
                        </button>
                      </div>
                    </footer>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No sub events for this event.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubEventDetails;
