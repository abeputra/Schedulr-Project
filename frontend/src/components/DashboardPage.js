import React, { useState, useEffect, useMemo } from "react";
import logo from "../assets/schedulr-logo-horizontal.png";
import backgroundMotif from "../assets/background-motif.png";
import {
  FaTachometerAlt,
  FaPlus,
  FaCalendar,
  FaUsers,
  FaFileAlt,
  FaClipboard,
  FaSignOutAlt,
} from "react-icons/fa";
import defaultProfileImage from "../assets/profile-photo-default.png";
import { useNavigate, Link } from "react-router-dom";

const DashboardPage = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();
  const [myTasks, setMyTasks] = useState([]);
  const [subEventDetails, setSubEventDetails] = useState(null); // State untuk subEvent details
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the profile page
  };

  useEffect(() => {
    const fetchUserSubEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/subevents/my-tasks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sub-events");
        }

        const data = await response.json();

        // Format ulang jika backend hanya kirim _id
        const formatted = data.map((item) => ({
          ...item,
          subeventId: item._id,
        }));

        setMyTasks(formatted);
      } catch (error) {
        console.error("Failed to fetch sub-events:", error);
      }
    };

    fetchUserSubEvents();
  }, []);

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
    setIsMenuOpen(!isMenuOpen); // Toggle hamburger icon animation
  };

  // Fetch sub-event details for a specific sub-event when clicked
  const fetchSubEventDetail = async (subEventId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/subevents/detail/${subEventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sub-event detail");
      }

      const data = await response.json();
      setSubEventDetails(data); // Set the sub-event details in state
    } catch (error) {
      console.error("Error fetching sub-event detail:", error);
    }
  };

  const now = new Date();

  const [upcomingTasks, pastTasks] = useMemo(() => {
    const upcoming = [];
    const past = [];

    myTasks.forEach((task) => {
      const taskDateTime = new Date(`${task.date}T${task.time}`);
      if (taskDateTime >= now) {
        upcoming.push(task);
      } else {
        past.push(task);
      }
    });

    return [upcoming, past];
  }, [myTasks]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Contoh: mode bisa dipilih user, atau hardcode dulu untuk testing
    const mode = "analisis"; // atau "input_event", "input_subevent"

    const newMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, newMessage]);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: "You are not logged in." },
        ]);
        return;
      }
      const response = await fetch("http://localhost:5000/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: chatInput, mode }), // <-- kirim mode
      });

      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.response || JSON.stringify(data.model, null, 2) },
      ]);
      setChatInput("");
    } catch (error) {
      console.error("Chatbot error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error." },
      ]);
    }
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
                to="/chatbot"
                style={{ color: "white", textDecoration: "none" }}
              >
                <FaCalendar style={{ marginRight: "1rem" }} />
                Schedulr AI
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
      {/* Tombol Schedule Event */}
      <h2
        className="title is-4"
        style={{
          color: "#0D1A2A",
          marginTop: "5rem",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: "2rem", // misalnya 2rem = 32px
          marginLeft: "16rem",
        }}
      >
        Recent Events
      </h2>
      <div
        className="is-flex"
        style={{ marginLeft: "16rem", marginTop: "0.5rem" }}
      >
        <Link
          to="/create"
          style={{
            backgroundColor: "#0D1A2A",
            color: "white",
            padding: "4rem 3rem",
            borderRadius: "1.2rem",
            fontWeight: "700",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            boxShadow: "0 8px 10px rgba(0, 0, 0, 0.2)",
            textDecoration: "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0E3360")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#0D1A2A")
          }
        >
          <FaPlus size={24} />
          Schedule Your Event
        </Link>
      </div>
      {/* === Upcoming Tasks === */}
      {upcomingTasks.length === 0 ? (
        <p
          className="title is-4"
          style={{
            marginLeft: "16rem",
            marginTop: "4rem",
            color: "#0D1A2A",
            marginBottom: "1.5rem",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "2rem", // misalnya 2rem = 32px
          }}
        >
          No upcoming tasks
        </p>
      ) : (
        <>
          <h2
            className="title is-4"
            style={{
              marginLeft: "16rem",
              marginTop: "4rem",
              color: "#0D1A2A",
              marginBottom: "1.5rem",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "2rem", // misalnya 2rem = 32px
            }}
          >
            Upcoming Events
          </h2>
          <div
            className="columns is-multiline"
            style={{ marginLeft: "15.4rem", marginRight: "15.4rem" }}
          >
            {upcomingTasks.map((task, index) => (
              <div
                key={index}
                className="column is-full" // Memastikan setiap task mengambil 1 baris penuh
                style={{ marginBottom: "0rem" }} // Jarak antar kolom jika diperlukan
              >
                <Link
                  to={`/subevents/detail/${task.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0E3360")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0D1A2A")
                    }
                    className="box"
                    style={{
                      backgroundColor: "#0D1A2A",
                      color: "white",
                      borderRadius: "1rem",
                      boxShadow: "0 8px 10px rgba(0, 0, 0, 0.2)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: "1.5rem",
                      gap: "1rem",
                      cursor: "pointer",
                      paddingTop: "1.5rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif", // Menetapkan jenis font Poppins
                          fontSize: "1.5rem", // Ukuran font
                          fontWeight: "700", // Ketebalan font
                          marginBottom: "0.5rem", // Jarak bawah antar elemen
                          letterSpacing: "0.05em", // Jarak antar huruf
                        }}
                      >
                        {task.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "1rem",
                          fontWeight: "600",
                          letterSpacing: "0.02em",
                          marginBottom: "0.5rem",
                          display: "flex", // Flexbox untuk menjaga agar tetap satu baris
                          alignItems: "center", // Vertikal tengah jika ada perbedaan tinggi
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold", // Menebalkan label
                            marginRight: "0rem", // Memberikan jarak antara "Description" dan nilai deskripsi
                            marginLeft: "0rem",
                          }}
                        ></span>
                        <span
                          style={{
                            fontWeight: "bold", // Menjaga agar nilai deskripsi tidak terlalu tebal
                            marginRight: "0.5rem", // Jarak antara Description dan Additional Description
                            marginLeft: "0rem",
                            color: "#F38B40",
                            fontSize: "1.1rem",
                          }}
                        >
                          {task.description}
                        </span>
                        <span
                          style={{
                            fontWeight: "bold", // Menebalkan label Additional Description
                            marginRight: "0.5rem", // Memberikan jarak antara "Additional Description" dan nilai deskripsi
                            color: "#F38B40",
                            fontSize: "1.1rem",
                          }}
                        >
                          -
                        </span>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#F38B40",
                            fontSize: "1.1rem",
                          }}
                        >
                          {task.additional_description}
                        </span>
                      </p>

                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif", // Menetapkan jenis font Poppins
                          fontWeight: "normal",
                          fontSize: "1rem", // Ukuran font
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em", // Jarak antar huruf
                        }}
                      >
                        Organized by {task.organizer}
                      </p>
                    </div>
                    <div style={{ flex: 0.6, textAlign: "right" }}>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "1rem",
                          fontWeight: "600",
                          letterSpacing: "0.02em",
                          paddingTop: "1rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold", // Menjaga agar nilai deskripsi tidak terlalu tebal
                            marginRight: "0.5rem", // Jarak antara Description dan Additional Description
                            marginLeft: "0rem",
                            color: "#FFFFFF",
                            fontSize: "1.1rem",
                          }}
                        >
                          {new Date(task.date).toLocaleDateString()}
                        </span>
                        <span
                          style={{
                            fontWeight: "bold", // Menebalkan label Additional Description
                            marginRight: "0.5rem", // Memberikan jarak antara "Additional Description" dan nilai deskripsi
                            color: "#FFFFFF",
                            fontSize: "1.1rem",
                          }}
                        >
                          -
                        </span>
                        <span>
                          <span
                            style={{
                              fontWeight: "bold",
                              marginRight: "0rem",
                              marginLeft: "0rem",
                              color: "#FFFFFF",
                              fontSize: "1.2rem",
                            }}
                          >
                            {task.time}
                          </span>
                        </span>
                      </p>

                      <p
                        style={{
                          paddingTop: "1rem",
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "1.2rem",
                          fontWeight: "600",
                          letterSpacing: "0.02em",
                        }}
                      >
                        <span style={{ color: "#FFFFFF" }}>Location:</span>{" "}
                        <span style={{ color: "#F38B40" }}>
                          {task.location}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
      {/* === Past Tasks === */}
      {pastTasks.length > 0 && (
        <>
          <h2
            className="title is-4"
            style={{
              marginLeft: "16rem",
              marginTop: "4rem",
              color: "#0D1A2A",
              marginBottom: "1.5rem",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "2rem", // misalnya 2rem = 32px
            }}
          >
            Past Events
          </h2>
          <div
            className="columns is-multiline"
            style={{
              marginLeft: "15.4rem",
              marginRight: "15.4rem",
            }}
          >
            {pastTasks.map((task, index) => (
              <div
                key={index}
                className="column is-full" // Memastikan setiap task mengambil 1 baris penuh
                style={{ marginBottom: "0rem" }} // Jarak antar kolom jika diperlukan
              >
                <Link
                  to={`/subevents/detail/${task.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0E3360")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0D1A2A")
                    }
                    className="box"
                    style={{
                      backgroundColor: "#0D1A2A",
                      color: "white",
                      borderRadius: "1rem",
                      boxShadow: "0 8px 10px rgba(0, 0, 0, 0.2)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: "1.5rem",
                      gap: "1rem",
                      cursor: "pointer",
                      paddingTop: "1.5rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif", // Menetapkan jenis font Poppins
                          fontSize: "1.5rem", // Ukuran font
                          fontWeight: "700", // Ketebalan font
                          marginBottom: "0.5rem", // Jarak bawah antar elemen
                          letterSpacing: "0.05em", // Jarak antar huruf
                        }}
                      >
                        {task.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "1rem",
                          fontWeight: "600",
                          letterSpacing: "0.02em",
                          marginBottom: "0.5rem",
                          display: "flex", // Flexbox untuk menjaga agar tetap satu baris
                          alignItems: "center", // Vertikal tengah jika ada perbedaan tinggi
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold", // Menebalkan label
                            marginRight: "0rem", // Memberikan jarak antara "Description" dan nilai deskripsi
                            marginLeft: "0rem",
                          }}
                        ></span>
                        <span
                          style={{
                            fontWeight: "bold", // Menjaga agar nilai deskripsi tidak terlalu tebal
                            marginRight: "0.5rem", // Jarak antara Description dan Additional Description
                            marginLeft: "0rem",
                            color: "#F38B40",
                            fontSize: "1.1rem",
                          }}
                        >
                          {task.description}
                        </span>
                        <span
                          style={{
                            fontWeight: "bold", // Menebalkan label Additional Description
                            marginRight: "0.5rem", // Memberikan jarak antara "Additional Description" dan nilai deskripsi
                            color: "#F38B40",
                            fontSize: "1.1rem",
                          }}
                        >
                          -
                        </span>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#F38B40",
                            fontSize: "1.1rem",
                          }}
                        >
                          {task.additional_description}
                        </span>
                      </p>

                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif", // Menetapkan jenis font Poppins
                          fontWeight: "normal",
                          fontSize: "1rem", // Ukuran font
                          marginTop: "0.7rem",
                          letterSpacing: "0.05em", // Jarak antar huruf
                        }}
                      >
                        Organized by {task.organizer}
                      </p>
                    </div>
                    <div style={{ flex: 0.6, textAlign: "right" }}>
                      <p
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "1rem",
                          fontWeight: "600",
                          letterSpacing: "0.02em",
                          paddingTop: "1rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold", // Menjaga agar nilai deskripsi tidak terlalu tebal
                            marginRight: "0.5rem", // Jarak antara Description dan Additional Description
                            marginLeft: "0rem",
                            color: "#FFFFFF",
                            fontSize: "1.1rem",
                          }}
                        >
                          {new Date(task.date).toLocaleDateString()}
                        </span>
                        <span
                          style={{
                            fontWeight: "bold",
                            marginRight: "0.5rem",
                            color: "#FFFFFF",
                            fontSize: "1.1rem",
                          }}
                        >
                          -
                        </span>
                        <span>
                          <span
                            style={{
                              fontWeight: "bold",
                              marginRight: "0rem",
                              marginLeft: "0rem",
                              color: "#FFFFFF",
                              fontSize: "1.2rem",
                            }}
                          >
                            {task.time}
                          </span>
                        </span>
                      </p>

                      <p
                        style={{
                          paddingTop: "1rem",
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: "1.2rem",
                          fontWeight: "600",
                          letterSpacing: "0.02em",
                        }}
                      >
                        <span style={{ color: "#FFFFFF" }}>Location:</span>{" "}
                        <span style={{ color: "#F38B40" }}>
                          {task.location}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div style={{ paddingBottom: "5rem" }}></div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
