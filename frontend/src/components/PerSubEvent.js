import React, { useEffect, useState } from "react";
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

const PerSubEvent = () => {
  const { subeventId } = useParams();
  const [subEvent, setSubEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling the hamburger animation
  const [profileImage, setProfileImage] = useState(null); // State for the user's profile image

  const navigate = useNavigate(); // ✅ Ini baris yang harus ditambahkan

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
    const fetchSubEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view this page.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/subevents/detail/${subeventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch sub-event details");
        }

        const data = await res.json();
        setSubEvent(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubEvent();
  }, [subeventId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const {
    id,
    eventId,
    title,
    description,
    additional_description,
    organizer,
    date: subEventDate, // renamed
    time: subEventTime, // renamed
    location,
    task_or_agenda,
    createdAt,
    updatedAt,
    assignedtasks,
    assignedmembers,
  } = subEvent;

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
              <Link to="/" style={{ color: "white", textDecoration: "none" }}>
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
      <div style={{ padding: "2rem" }}>
        <h1>Sub Event Detail</h1>
        <ul style={{ listStyle: "none", padding: 0, lineHeight: "1.8" }}>
          <li>
            <strong>ID:</strong> {id}
          </li>
          <li>
            <strong>Event ID:</strong> {eventId}
          </li>
          <li>
            <strong>Title:</strong> {title}
          </li>
          <li>
            <strong>Description:</strong> {description}
          </li>
          <li>
            <strong>Additional Description:</strong> {additional_description}
          </li>
          <li>
            <strong>Organizer:</strong> {organizer}
          </li>
          <li>
            <strong>Date:</strong> {subEventDate}
          </li>
          <li>
            <strong>Time:</strong> {subEventTime}
          </li>
          <li>
            <strong>Location:</strong> {location}
          </li>
          <li>
            <strong>Task/Agenda:</strong> {task_or_agenda}
          </li>
          <li>
            <strong>Created At:</strong> {new Date(createdAt).toLocaleString()}
          </li>
          <li>
            <strong>Updated At:</strong> {new Date(updatedAt).toLocaleString()}
          </li>

          {task_or_agenda === "task" && assignedtasks?.length > 0 && (
            <>
              <li>
                <strong>Assigned Tasks:</strong>
              </li>
              <ul>
                {assignedtasks.map((task, index) => (
                  <li key={index}>
                    • {task.taskType} ({task.email})
                  </li>
                ))}
              </ul>
            </>
          )}

          {task_or_agenda === "agenda" && (
            <>
              <li>
                <strong>Assigned Members:</strong>
              </li>
              <ul>
                {(() => {
                  const cleaned = String(assignedmembers)
                    .replace(/[{}]/g, "")
                    .trim();

                  if (!cleaned) {
                    return <li>(No assigned members)</li>;
                  }

                  return <li>• {cleaned}</li>;
                })()}
              </ul>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PerSubEvent;
