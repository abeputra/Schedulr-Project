import React, { useState, useEffect } from "react";
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
} from "react-icons/fa"; // Importing relevant icons
import defaultProfileImage from "../assets/profile-photo-default.png";
import { useNavigate, Link } from "react-router-dom";

interface Event {
  id: number;
  title: string;
  organizer: string;
  description: string;
  invited_members: string[];
}

const CreatePage = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState({
    title: "",
    organizer: "",
    description: "",
    invited_members: [], // Array yang menyimpan email yang diundang
  });
  const [emailInput, setEmailInput] = useState(""); // Untuk input email sementara

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsMenuOpen(!isMenuOpen);
  };

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

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch events");
        return;
      }

      const data = await response.json();

      // Debugging data yang diterima
      console.log("Fetched data:", data);

      const parsedData = data.map((event: Event) => ({
        ...event,
        invited_members: Array.isArray(event.invited_members)
          ? event.invited_members
          : JSON.parse(event.invited_members || "[]"),
      }));

      setEvents(parsedData);
    } catch (err) {
      console.error("Error fetching events:", err.message);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 🧹 Handle Delete Event
  const handleDelete = async (eventId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }

      const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to delete event");
        return;
      }

      // Hapus dari state
      setEvents(events.filter((event) => event.id !== eventId));

      // 🔔 Tampilkan notifikasi
      window.alert("Event berhasil dihapus!");
    } catch (err) {
      console.error("Error deleting event:", err.message);
    }
  };

  // Mengambil email user yang sedang login
  const getUserEmail = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      return decodedToken.email;
    }
    return null;
  };

  const userEmail = getUserEmail();

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setEmailInput(""); // Reset email input saat membuka modal
    setIsEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedEvent) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: Token not found");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${selectedEvent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: selectedEvent.title,
            organizer: selectedEvent.organizer,
            description: selectedEvent.description,
            invited_members: selectedEvent.invited_members,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Update error:", result);
        alert(result.message || "Failed to update event");
        return;
      }

      const updatedEvents = events.map((e) =>
        e.id === selectedEvent.id ? result : e
      );
      setEvents(updatedEvents);
      setIsEditModalOpen(false);
      alert("Event updated successfully!");
    } catch (err) {
      console.error("Error updating event:", err);
      alert("An unexpected error occurred.");
    }
  };

  const handleEmailChange = (e) => {
    setEmailInput(e.target.value);
  };

  const handleAddEmail = () => {
    if (
      emailInput &&
      !selectedEvent.invited_members.includes(emailInput.trim())
    ) {
      setSelectedEvent({
        ...selectedEvent,
        invited_members: [...selectedEvent.invited_members, emailInput.trim()],
      });
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email) => {
    setSelectedEvent({
      ...selectedEvent,
      invited_members: selectedEvent.invited_members.filter(
        (item) => item !== email
      ),
    });
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
      {/* Add Button */}
      <div
        className="is-flex is-justify-content-center is-align-items-center"
        style={{ marginTop: "4rem" }}
      >
        <Link
          to="/details"
          style={{
            backgroundColor: "#007BFF",
            color: "white",
            padding: "2rem 3rem",
            borderRadius: "1rem",
            fontWeight: "bold",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            textDecoration: "none",
          }}
        >
          <FaPlus size={24} />
          Add New
        </Link>
      </div>
      {/* Invited Events */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Invited Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-500">You have no invited events.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="p-4 border rounded shadow hover:bg-gray-100 transition"
              >
                <Link
                  to={`/subevent/${event.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p>
                    <strong>Organizer:</strong> {event.organizer}
                  </p>
                  <p>
                    <strong>Description:</strong> {event.description}
                  </p>
                  <p>
                    <strong>Invited Members:</strong>{" "}
                    {Array.isArray(event.invited_members)
                      ? event.invited_members.join(", ")
                      : "-"}
                  </p>
                </Link>
                {/* Tombol Delete di luar Link */}
                {userEmail === event.creator_email && (
                  <div className="card-footer">
                    <button
                      className="button is-danger"
                      onClick={(e) => {
                        e.stopPropagation(); // Mencegah klik pada tombol delete memicu navigasi
                        handleDelete(event.id);
                      }}
                    >
                      <FaTrash style={{ marginRight: "0.5rem" }} />
                      Delete
                    </button>
                  </div>
                )}
                {userEmail === event.creator_email && (
                  <>
                    <div
                      className="card-footer"
                      style={{ marginTop: "0.5rem" }}
                    >
                      <button
                        className="button is-warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(event);
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        // Edit Modal JSX
        {isEditModalOpen && selectedEvent && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "1rem",
                width: "90%",
                maxWidth: "500px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
              }}
            >
              <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
                Edit Event
              </h2>
              <div className="field">
                <label className="label">Title</label>
                <input
                  className="input"
                  type="text"
                  value={selectedEvent.title}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="field">
                <label className="label">Organizer</label>
                <textarea
                  className="textarea"
                  value={selectedEvent.organizer}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      organizer: e.target.value,
                    })
                  }
                />
              </div>
              <div className="field">
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  value={selectedEvent.description}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="field">
                <label className="label">Invited Members (Email)</label>
                <div className="input-group">
                  <input
                    className="input"
                    type="email"
                    value={emailInput}
                    onChange={handleEmailChange}
                    placeholder="Enter email"
                  />
                  <button
                    className="button is-primary"
                    onClick={handleAddEmail}
                    disabled={!emailInput}
                  >
                    Add
                  </button>
                </div>
                <small>Enter email address and click "Add".</small>
              </div>
              <ul>
                {selectedEvent.invited_members.map((email, idx) => (
                  <li key={idx}>
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      style={{ marginLeft: "8px" }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="field is-grouped" style={{ marginTop: "1rem" }}>
                <button className="button is-success" onClick={handleEditSave}>
                  Save
                </button>
                <button
                  className="button is-light"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePage;
