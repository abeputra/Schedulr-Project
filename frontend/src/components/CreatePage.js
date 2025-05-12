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
} from "react-icons/fa";
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

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
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
          <img
            src={logo}
            alt="Schedulr Logo"
            style={{ width: "80%", marginBottom: "1rem" }}
          />
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
              <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                <FaSignOutAlt style={{ marginRight: "1rem" }} />
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Navbar */}
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
              transition: "0.3s",
            }}
            onClick={toggleSidebar}
          >
            <div
              style={{
                width: "30px",
                height: "4px",
                backgroundColor: "white",
                margin: "-0.5",
                transition: "0.3s",
                transform: isMenuOpen
                  ? "rotate(90deg) translateY(8px)"
                  : "none",
              }}
            ></div>
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "white",
                margin: "-0.5",
                transition: "0.3s",
                opacity: isMenuOpen ? "0" : "1",
              }}
            ></div>
            <div
              style={{
                width: "30px",
                height: "4px",
                backgroundColor: "white",
                margin: "0",
                transition: "0.3s",
                transform: isMenuOpen
                  ? "rotate(-90deg) translateY(-8px)"
                  : "none",
              }}
            ></div>
          </div>

          <div className="navbar-brand">
            <img
              src={logo}
              alt="Schedulr Logo"
              className="object-contain"
              style={{ width: "clamp(200px, 20vw, 300px)" }}
            />
          </div>

          <div
            className="is-flex is-align-items-center"
            style={{
              gap: "1.5rem",
              flexGrow: 1,
              justifyContent: "flex-end",
              fontWeight: 600,
              fontSize: "clamp(0.5rem, 2vw, 1rem)",
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
                    fontSize: "clamp(0.5rem, 2vw, 1rem)",
                  }}
                >
                  ({timezone})
                </span>
              </div>
            </div>

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
                  fontSize: "clamp(0.5rem, 2vw, 1rem)",
                  color: "white",
                  backgroundColor: "#0D1A2A",
                  border: "2px solid white",
                }}
              />
            </div>

            <a
              href="/profile"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid white",
                marginLeft: "0rem",
                display: "inline-block",
              }}
            >
              <img
                src={profileImage || defaultProfileImage}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CreatePage;
