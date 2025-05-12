import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/schedulr-logo-horizontal.png";
import {
  FaTachometerAlt,
  FaPlus,
  FaCalendar,
  FaUsers,
  FaFileAlt,
  FaClipboard,
  FaSignOutAlt,
  FaTrash,
} from "react-icons/fa";
import defaultProfileImage from "../assets/profile-photo-default.png";

const EventDetails = () => {
  const [eventName, setEventName] = useState("");
  const [organizer, setOrganizer] = useState(""); // Organizer tetap bisa diubah
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([""]);
  const [events, setEvents] = useState([]);
  const [eventCreatorEmail, setEventCreatorEmail] = useState(""); // State untuk email creator
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling the hamburger animation
  const [profileImage, setProfileImage] = useState(null); // State for the user's profile image
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
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

  // Ambil email creator dari token JWT atau localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode token
        const email = decodedToken.email; // Misalnya token menyimpan email
        setEventCreatorEmail(email); // Set email creator
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const handleAddMember = () => {
    setMembers([...members, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: eventName,
          organizer,
          description,
          invited_members: members,
          creator_email: eventCreatorEmail, // Menyertakan email creator dalam request
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Event created successfully");
        setEventName("");
        setOrganizer("");
        setDescription("");
        setMembers([""]);
        fetchEvents();
        navigate("/create"); // ✅ Redirect after successful creation
      } else {
        alert("Failed to create event: " + data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }

      const res = await fetch("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch events");
        return;
      }

      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err.message);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
      <div className="container mt-5">
        <h2 className="title is-3" style={{ color: "#0D1A2A" }}>
          Create New Event
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" style={{ color: "#0D1A2A" }}>
              Event Name
            </label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label" style={{ color: "#0D1A2A" }}>
              Organizer
            </label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)} // Organizer bisa diubah
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label" style={{ color: "#0D1A2A" }}>
              Event Creator (Email)
            </label>
            <div className="control">
              <input
                className="input"
                type="email"
                value={eventCreatorEmail} // Email creator diisi otomatis
                readOnly
              />
            </div>
          </div>

          <div className="field">
            <label className="label" style={{ color: "#0D1A2A" }}>
              Description
            </label>
            <div className="control">
              <textarea
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
          </div>

          <div className="field">
            <label className="label" style={{ color: "#0D1A2A" }}>
              Invite Members
            </label>
            {members.map((member, index) => (
              <div className="control mb-2" key={index}>
                <input
                  className="input"
                  type="email"
                  placeholder="Member email"
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  required
                />
              </div>
            ))}
            <button
              type="button"
              className="button is-link is-light"
              onClick={handleAddMember}
            >
              Add Member
            </button>
          </div>

          <div className="field mt-4">
            <div className="control">
              <button type="submit" className="button is-primary">
                Create Event
              </button>
              <button
                type="button"
                className="button is-light ml-2"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </form>

        <hr className="my-6" />

        <h2 className="title is-4" style={{ color: "#0D1A2A" }}>
          Recent Event Created
        </h2>
        {events.length === 0 ? (
          <p style={{ color: "#0D1A2A" }}>You have no events.</p>
        ) : (
          <div className="columns is-multiline">
            {events.map((event) => (
              <div className="column is-4" key={event.id}>
                <div className="card">
                  <div className="card-content">
                    <p className="title is-5">{event.title}</p>
                    <p className="subtitle is-6">
                      <strong>Organizer:</strong> {event.organizer || "Unknown"}
                    </p>
                    <p>
                      <strong>Description:</strong> {event.description}
                    </p>
                    <p>
                      <strong>Members Invited:</strong>{" "}
                      {event.invited_members?.length || 0}
                    </p>
                    <p>
                      <strong>Creator:</strong>{" "}
                      {event.creator_email || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
