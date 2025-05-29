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
import backgroundMotif from "../assets/background-motif.png";

interface Event {
  id: number;
  title: string;
  organizer: string;
  description: string;
  invited_members: string[];
}

const CreatePage = () => {
  const [showModal, setShowModal] = useState(false);

  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);

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
    <div
      style={{
        backgroundImage: `url(${backgroundMotif})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
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
      {/* Event List Column */}
      <div
        style={{
          marginTop: "2rem",
          marginLeft: "16rem",
          marginRight: "16rem",
          paddingBottom: "6rem",
        }}
      >
        <h2
          className="title is-4"
          style={{
            color: "#0D1A2A",
            marginTop: "5rem",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "2rem", // misalnya 2rem = 32px
          }}
        >
          Your Events
        </h2>

        <div className="columns is-multiline">
          {/* Kotak "Add New Event" */}
          <div className="column is-full-mobile is-half-tablet is-one-third-desktop">
            <Link
              to="/details"
              style={{
                textDecoration: "none",
              }}
            >
              <div
                className="box is-flex is-justify-content-center is-align-items-center"
                style={{
                  backgroundColor: "#F38B40",
                  color: "white",
                  padding: "4rem 3rem",
                  borderRadius: "1.2rem",
                  fontWeight: "700",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                  height: "100%",
                  cursor: "pointer",
                  boxShadow: "0 8px 10px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0E3360";
                  e.currentTarget.style.color = "white"; // ubah font jadi putih saat hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#F38B40"; // kembali ke warna asal
                  e.currentTarget.style.color = "#0D1A2A"; // font kembali ke asal
                }}
              >
                <FaPlus size={32} />
                Add New Event
              </div>
            </Link>
          </div>

          {/* Kotak-kotak event */}
          {events.map((event) => (
            <div
              key={event.id}
              className="column is-full-mobile is-half-tablet is-one-third-desktop"
            >
              <div
                className="box"
                style={{
                  backgroundColor: "#0D1A2A",
                  color: "white",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0E3360";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0D1A2A";
                }}
              >
                <Link
                  to={`/subevent/${event.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                    }}
                  >
                    {event.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "normal",
                      marginBottom: "0.3rem",
                    }}
                  >
                    Organized by {event.organizer}
                  </p>
                  <p
                    style={{
                      fontSize: "1rem",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "normal",
                      marginBottom: "0.3rem",
                    }}
                  >
                    Description
                    <span style={{ marginLeft: "3.7rem" }}>
                      : {event.description}
                    </span>
                  </p>
                </Link>

                <p
                  style={{
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: "normal",
                    marginBottom: "1.5rem",
                  }}
                >
                  Invited Members
                  <span style={{ marginLeft: "1rem" }}>
                    :{" "}
                    {Array.isArray(event.invited_members)
                      ? event.invited_members.length
                      : 0}
                  </span>
                </p>

                {/* Tombol aksi */}
                <div
                  className="buttons mt-3 is-flex is-justify-content-start"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  {Array.isArray(event.invited_members) &&
                    event.invited_members.length > 0 && (
                      <button
                        className="button"
                        style={{
                          backgroundColor: "#FFFFFF",
                          flex: 0.3,
                          marginRight: "1rem",
                          fontSize: "1rem",
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: "bold",
                          color: "#000000",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setModalEvent(event);
                          setShowModal(true);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#888888";
                          e.currentTarget.style.color = "#FFFFFF"; // kembali ke putih
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#FFFFFF";
                          e.currentTarget.style.color = "#000000"; // misalnya jadi kuning saat hover
                        }}
                      >
                        View
                      </button>
                    )}

                  {userEmail === event.creator_email && (
                    <>
                      <button
                        className="button"
                        style={{
                          backgroundColor: "#A80000",
                          flex: 0.3,
                          marginLeft: "1rem",
                          fontSize: "1rem",
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: "bold",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.id);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#DB0101";
                          e.currentTarget.style.color = "#000000"; // misalnya jadi kuning saat hover
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#A80000";
                          e.currentTarget.style.color = "#FFFFFF"; // kembali ke putih
                        }}
                      >
                        <FaTrash style={{ marginRight: "auto" }} />
                        Delete
                      </button>

                      <button
                        className="button"
                        style={{
                          backgroundColor: "#FFC800",
                          flex: 0.3,
                          marginLeft: "auto",
                          fontSize: "1rem",
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: "bold",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(event);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#BD4F00";
                          e.currentTarget.style.color = "#FFFFFF"; // kembali ke putih
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#FFC800";
                          e.currentTarget.style.color = "#000000"; // misalnya jadi kuning saat hover
                        }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>

                {/* Modal View */}
                {showModal && modalEvent && (
                  <div className="modal is-active">
                    <div
                      className="modal-background"
                      onClick={() => setShowModal(false)}
                    ></div>
                    <div className="modal-card">
                      <header className="modal-card-head">
                        <p
                          className="modal-card-title"
                          style={{
                            color: "#0D1A2A",
                            fontSize: "2rem",
                            fontWeight: "bold",
                          }}
                        >
                          Event Details
                        </p>
                        <button
                          className="delete"
                          aria-label="close"
                          onClick={() => setShowModal(false)}
                        ></button>
                      </header>
                      <section className="modal-card-body">
                        <div className="content">
                          <p
                            style={{
                              fontSize: "1.2rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <span
                              style={{ color: "#0D1A2A", fontWeight: "bold" }}
                            >
                              Title{" "}
                            </span>
                            <span style={{ color: "#333", marginLeft: "8rem" }}>
                              : {modalEvent.title}
                            </span>
                          </p>
                          <p
                            style={{
                              fontSize: "1.2rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <span
                              style={{ color: "#0D1A2A", fontWeight: "bold" }}
                            >
                              Organizer{" "}
                            </span>
                            <span
                              style={{ color: "#333", marginLeft: "4.5rem" }}
                            >
                              : {modalEvent.organizer}
                            </span>
                          </p>
                          <p
                            style={{
                              fontSize: "1.2rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <span
                              style={{ color: "#0D1A2A", fontWeight: "bold" }}
                            >
                              Description{" "}
                            </span>
                            <span
                              style={{ color: "#333", marginLeft: "3.5rem" }}
                            >
                              : {modalEvent.description}
                            </span>
                          </p>

                          <p
                            style={{
                              fontSize: "1.2rem",
                              color: "#0D1A2A",
                              fontWeight: "bold",
                              marginTop: "3rem",
                            }}
                          >
                            Invited Members:
                          </p>
                          <ul>
                            {modalEvent.invited_members.map((email, index) => (
                              <li
                                key={index}
                                style={{ fontSize: "1.2rem", color: "#0D1A2A" }}
                              >
                                {email}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </section>
                      <footer className="modal-card-foot">
                        <button
                          className="button"
                          onClick={() => setShowModal(false)}
                          style={{ backgroundColor: "#0D1A2A" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#F38B40";
                            e.currentTarget.style.color = "#FFFFFF"; // ubah font jadi putih saat hover
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#0D1A2A"; // kembali ke warna asal
                            e.currentTarget.style.color = "#FFFFFF"; // font kembali ke asal
                          }}
                        >
                          Close
                        </button>
                      </footer>
                    </div>
                  </div>
                )}

                {/* Modal Edit */}
                {isEditModalOpen && (
                  <div className="modal is-active">
                    <div
                      className="modal-background"
                      onClick={() => setIsEditModalOpen(false)}
                    ></div>
                    <div className="modal-card">
                      <header className="modal-card-head">
                        <p
                          className="modal-card-title"
                          style={{
                            color: "#0D1A2A",
                            fontSize: "2rem",
                            fontWeight: "bold",
                          }}
                        >
                          Edit Event
                        </p>
                        <button
                          className="delete"
                          aria-label="close"
                          onClick={() => setIsEditModalOpen(false)}
                        ></button>
                      </header>
                      <section className="modal-card-body">
                        <div className="field">
                          <label
                            className="label"
                            style={{
                              color: "#0D1A2A",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 500,
                              fontSize: "1.2rem",
                              marginBottom: "0.1rem",
                            }}
                          >
                            Title
                          </label>
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
                            style={{
                              fontSize: "1.1rem",
                              marginBottom: "0.5rem",
                            }}
                          />
                        </div>

                        <div className="field">
                          <label
                            className="label"
                            style={{
                              color: "#0D1A2A",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 500,
                              fontSize: "1.2rem",
                              marginBottom: "0.1rem",
                            }}
                          >
                            Organizer
                          </label>
                          <input
                            className="input"
                            type="text"
                            value={selectedEvent.organizer}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                organizer: e.target.value,
                              })
                            }
                            style={{
                              fontSize: "1.1rem",
                              marginBottom: "0.5rem",
                            }}
                          />
                        </div>

                        <div className="field">
                          <label
                            className="label"
                            style={{
                              color: "#0D1A2A",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 500,
                              fontSize: "1.2rem",
                              marginBottom: "0.1rem",
                            }}
                          >
                            Description
                          </label>
                          <textarea
                            className="textarea"
                            value={selectedEvent.description}
                            onChange={(e) =>
                              setSelectedEvent({
                                ...selectedEvent,
                                description: e.target.value,
                              })
                            }
                            style={{
                              fontSize: "1.1rem",
                              marginBottom: "0.5rem",
                            }}
                          ></textarea>
                        </div>

                        <div className="field">
                          <label
                            className="label"
                            style={{
                              color: "#0D1A2A",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "bold",
                              fontSize: "1.2rem",
                              marginTop: "2rem",
                            }}
                          >
                            Invited Members
                          </label>
                          <div className="tags">
                            {selectedEvent.invited_members.map(
                              (email, index) => (
                                <span key={index} className="tag is-info">
                                  {email}
                                  <button
                                    className="delete is-small"
                                    onClick={() => handleRemoveEmail(email)}
                                  ></button>
                                </span>
                              )
                            )}
                          </div>
                          <div
                            className="field has-addons mt-2"
                            style={{
                              display: "flex",
                              gap: "0.75rem",
                              marginTop: "1rem",
                            }}
                          >
                            <div className="control is-expanded">
                              <input
                                className="input"
                                type="email"
                                placeholder="Add new member by email"
                                value={emailInput}
                                onChange={handleEmailChange}
                                style={{
                                  fontSize: "1.1rem",
                                  fontStyle: "italic",
                                  marginTop: "1rem",
                                }}
                              />
                            </div>
                            <div className="control">
                              <button
                                className="button is-link"
                                onClick={handleAddEmail}
                                style={{
                                  marginTop: "1rem",
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </section>
                      <footer
                        className="modal-card-foot"
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          marginTop: "0.1rem",
                        }}
                      >
                        <button
                          className="button is-success"
                          onClick={handleEditSave}
                          style={{
                            backgroundColor: "#0D1A2A",
                            color: "#FFFFFF",
                          }}
                        >
                          Save Changes
                        </button>
                        <button
                          className="button"
                          onClick={() => setIsEditModalOpen(false)}
                          style={{
                            backgroundColor: "#930101",
                            color: "#FFFFFF",
                          }}
                        >
                          Cancel
                        </button>
                      </footer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
