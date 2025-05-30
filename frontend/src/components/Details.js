import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  FaTrash,
} from "react-icons/fa";
import defaultProfileImage from "../assets/profile-photo-default.png";

const Details = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to manage sidebar visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling the hamburger animation
  const [profileImage, setProfileImage] = useState(null); // State for the user's profile image
  const [eventName, setEventName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([""]);
  const [eventCreatorEmail, setEventCreatorEmail] = useState("");
  const [events, setEvents] = useState([]);

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

  const handleAddMember = async () => {
    // Tambahkan 'async' pada fungsi ini
    setMembers([...members, ""]);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://20.115.99.118:5000/api/events", {
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
    // Pastikan fetchEvents juga async
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }

      const res = await fetch("http://20.115.99.118:5000/api/events", {
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

  const [subEvent, setSubEvent] = useState({
    title: "",
    description: "",
    additional_description: "",
    date: "",
    time: "",
    location: "",
    taskOrAgenda: "task",
  });
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [taskTypes, setTaskTypes] = useState([
    "Fotografer",
    "Videografer",
    "Notulen",
    "MC",
    "Lainnya",
  ]);

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("");
  const yourToken = localStorage.getItem("token");

  // Fetch invited members from backend
  useEffect(() => {
    const fetchInvitedMembers = async () => {
      try {
        const res = await fetch(
          `http://20.115.99.118:5000/api/subevents/invited-members/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${yourToken}`, // pastikan ada token jika pakai verifyToken
            },
          }
        );
        const data = await res.json();
        console.log("Fetched invited members:", data); // cek apa yang diterima
        setInvitedMembers(data);
      } catch (error) {
        console.error("Failed to fetch invited members:", error);
      }
    };

    if (eventId) {
      fetchInvitedMembers();
    }
  }, [eventId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add task or member assignment
  const handleAddAssignment = () => {
    if (!selectedMember) return;

    if (subEvent.taskOrAgenda === "task") {
      if (!selectedTaskType) return;
      setAssignedTasks((prev) => [
        ...prev,
        { email: selectedMember, taskType: selectedTaskType },
      ]);
    } else {
      setAssignedTasks((prev) => [...prev, { email: selectedMember }]);
    }

    setSelectedMember("");
    setSelectedTaskType("");
  };

  // Remove assigned task or member
  const handleRemoveAssigned = (email) => {
    setAssignedTasks((prev) => prev.filter((t) => t.email !== email));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isTask = subEvent.taskOrAgenda === "task";

    const payload = {
      title: subEvent.title,
      description: subEvent.description,
      additional_description: subEvent.additional_description,
      date: subEvent.date,
      time: subEvent.time,
      location: subEvent.location,
      task_or_agenda: ["task", "agenda"].includes(subEvent.taskOrAgenda)
        ? subEvent.taskOrAgenda
        : "task",

      eventId,
      organizer: "",
      assignedtasks: isTask ? assignedTasks : [],
      assignedmembers: !isTask ? assignedTasks.map((t) => t.email) : [],
    };

    try {
      const res = await fetch("http://20.115.99.118:5000/api/subevents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${yourToken}`, // ✅ tambahkan token di sini
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Sub Event added successfully");
        navigate(`/subevent/${eventId}`);
      } else {
        const error = await res.json();
        console.error("Error from server:", error);
        alert("Failed to add sub event");
      }
    } catch (error) {
      console.error("Error submitting sub event:", error);
    }
  };

  const [editIndex, setEditIndex] = useState(null);
  const [editMember, setEditMember] = useState("");
  const [editTaskType, setEditTaskType] = useState("");

  const handleEdit = (index) => {
    const item = assignedTasks[index];
    setEditIndex(index);
    setEditMember(item.email);
    setEditTaskType(item.taskType || "");
  };

  const handleSaveEdit = () => {
    const updated = [...assignedTasks];
    updated[editIndex] = {
      email: editMember,
      ...(subEvent.taskOrAgenda === "task" && { taskType: editTaskType }),
    };
    setAssignedTasks(updated);
    setEditIndex(null);
    setEditMember("");
    setEditTaskType("");
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditMember("");
    setEditTaskType("");
  };

  return (
    <div
      style={{ backgroundImage: `url(${backgroundMotif})`, minHeight: "100vh" }}
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ padding: "24px", width: "75%" }}>
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
            Add New Sub Event
          </h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label
                style={{
                  color: "#0D1A2A",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                }}
              >
                Title:
              </label>
              <br />
              <input
                className="input"
                type="text"
                name="title"
                value={subEvent.title}
                onChange={handleInputChange}
                required
                placeholder="Enter the title"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontStyle: "italic",
                  fontSize: "1.2rem",
                  height: "3.5rem",
                  borderRadius: "0.8rem",
                  marginTop: "0.5rem",
                  marginBottom: "1rem",
                  backgroundColor: "#0d1a2a",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: "#0D1A2A",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                }}
              >
                Description:
              </label>
              <br />
              <textarea
                className="textarea custom-textarea"
                name="description"
                value={subEvent.description}
                onChange={handleInputChange}
                required
                placeholder="Enter the description"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontStyle: "italic",
                  fontSize: "1.2rem",
                  height: "3.5rem",
                  borderRadius: "0.8rem",
                  marginTop: "0.5rem",
                  marginBottom: "1rem",
                  backgroundColor: "#0d1a2a",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: "#0D1A2A",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                }}
              >
                Additional Description:
              </label>
              <br />
              <textarea
                className="textarea custom-textarea"
                name="additional_description"
                value={subEvent.additional_description}
                onChange={handleInputChange}
                required
                placeholder="Enter the description"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontStyle: "italic",
                  fontSize: "1.2rem",
                  height: "3.5rem",
                  borderRadius: "0.8rem",
                  marginTop: "0.5rem",
                  marginBottom: "1rem",
                  backgroundColor: "#0d1a2a",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: "#0D1A2A",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                }}
              >
                Date:
              </label>
              <br />
              <input
                className="input"
                type="date"
                name="date"
                value={subEvent.date}
                onChange={handleInputChange}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontStyle: "italic",
                  fontSize: "1.2rem",
                  height: "3.5rem",
                  borderRadius: "0.8rem",
                  marginTop: "0.5rem",
                  marginBottom: "1rem",
                  backgroundColor: "#0d1a2a",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: "#0D1A2A",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                }}
              >
                Time:
              </label>
              <br />
              <input
                className="input"
                type="time"
                name="time"
                value={subEvent.time}
                onChange={handleInputChange}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontStyle: "italic",
                  fontSize: "1.2rem",
                  height: "3.5rem",
                  borderRadius: "0.8rem",
                  marginTop: "0.5rem",
                  marginBottom: "1rem",
                  backgroundColor: "#0d1a2a",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: "#0D1A2A",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                }}
              >
                Location:
              </label>
              <br />
              <input
                className="input"
                type="text"
                name="location"
                value={subEvent.location}
                onChange={handleInputChange}
                required
                placeholder="Enter the location"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontStyle: "italic",
                  fontSize: "1.2rem",
                  height: "3.5rem",
                  borderRadius: "0.8rem",
                  marginTop: "0.5rem",
                  marginBottom: "1rem",
                  backgroundColor: "#0d1a2a",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  color: "#0D1A2A",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: "1.2rem",
                }}
              >
                Task or Agenda:
              </label>
              <br />
              <select
                name="taskOrAgenda"
                value={subEvent.taskOrAgenda}
                onChange={handleInputChange}
                className="input"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontStyle: "italic",
                  fontSize: "1.2rem",
                  height: "3.5rem",
                  borderRadius: "0.8rem",
                  marginTop: "0.5rem",
                  marginBottom: "1rem",
                  backgroundColor: "#0d1a2a",
                }}
              >
                <option value="task">Task Distribution</option>
                <option value="agenda">Agenda</option>
              </select>
            </div>

            {(subEvent.taskOrAgenda === "task" ||
              subEvent.taskOrAgenda === "agenda") && (
              <div style={{ marginTop: "20px" }}>
                <h3
                  style={{
                    color: "#0D1A2A",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: "1.2rem",
                  }}
                >
                  {subEvent.taskOrAgenda === "task"
                    ? "Assign Tasks"
                    : "Assign Members"}
                </h3>

                <table
                  className="table is-fullwidth is-striped"
                  style={{
                    backgroundColor: "#0d1a2a",
                    borderRadius: "15px",
                    border: "none",
                    borderCollapse: "collapse",
                    marginTop: "0.5rem",
                    tableLayout: "fixed",
                  }}
                >
                  <thead>
                    <tr>
                      <th colSpan={subEvent.taskOrAgenda === "task" ? 3 : 2}>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ flex: 1 }}>Assigned Member</span>
                          {subEvent.taskOrAgenda === "task" && (
                            <span style={{ flex: 1.1 }}>Task Type</span>
                          )}
                          <span style={{ width: "auto" }}></span>{" "}
                          {/* spacer for Add button */}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={subEvent.taskOrAgenda === "task" ? 3 : 2}>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem", // spasi antar elemen
                            alignItems: "center",
                            marginBottom: "1rem",
                          }}
                        >
                          {/* Select Member */}
                          <div
                            className="select is-fullwidth"
                            style={{ flex: 1 }}
                          >
                            <select
                              value={selectedMember}
                              onChange={(e) =>
                                setSelectedMember(e.target.value)
                              }
                              style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1rem",
                                height: "3rem",
                                borderRadius: "0.6rem",
                                backgroundColor: "#FFFFFF",
                                color: "#0D1A2A",
                                width: "100%",
                              }}
                            >
                              <option value="">Select Member</option>
                              {invitedMembers
                                .filter(
                                  (email) =>
                                    !assignedTasks.some(
                                      (task) => task.email === email
                                    )
                                )
                                .map((email, index) => (
                                  <option key={index} value={email}>
                                    {email}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Task Type (if applicable) */}
                          {subEvent.taskOrAgenda === "task" && (
                            <div
                              className="select is-fullwidth"
                              style={{ flex: 1 }}
                            >
                              <select
                                value={selectedTaskType}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "__add_new__") {
                                    const newType = window.prompt(
                                      "Enter new task type:"
                                    );
                                    if (
                                      newType &&
                                      !taskTypes.includes(newType)
                                    ) {
                                      setTaskTypes((prev) => [
                                        ...prev,
                                        newType,
                                      ]);
                                      setSelectedTaskType(newType);
                                    }
                                  } else {
                                    setSelectedTaskType(value);
                                  }
                                }}
                                style={{
                                  fontFamily: "'Poppins', sans-serif",
                                  fontSize: "1rem",
                                  height: "3rem",
                                  borderRadius: "0.6rem",
                                  backgroundColor: "#FFFFFF",
                                  color: "#0D1A2A",
                                  width: "100%",
                                }}
                              >
                                <option value="">Select Task Type</option>
                                {taskTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                                <option value="__add_new__">
                                  + Add new...
                                </option>
                              </select>
                            </div>
                          )}

                          {/* Add button */}
                          <div>
                            <button
                              type="button"
                              className="button is-link"
                              onClick={handleAddAssignment}
                              style={{ height: "3rem" }}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {assignedTasks.length > 0 && (
                  <div style={{ marginTop: "1.5rem" }}>
                    <h4 className="title is-5" style={{ color: "#0D1A2A" }}>
                      {subEvent.taskOrAgenda === "task"
                        ? "Assigned Tasks"
                        : "Assigned Members"}
                    </h4>

                    <table className="table is-fullwidth is-hoverable">
                      <thead>
                        <tr>
                          <th>Member</th>
                          {subEvent.taskOrAgenda === "task" && <th>Task</th>}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedTasks.map(({ email, taskType }, index) => (
                          <tr key={email}>
                            {editIndex === index ? (
                              <>
                                <td>
                                  <div className="select is-fullwidth">
                                    <select
                                      value={editMember}
                                      onChange={(e) =>
                                        setEditMember(e.target.value)
                                      }
                                      style={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: "1rem",
                                        height: "2.8rem",
                                      }}
                                    >
                                      {invitedMembers
                                        .filter(
                                          (member) =>
                                            member === email ||
                                            !assignedTasks.some(
                                              (t, i) =>
                                                t.email === member &&
                                                i !== index
                                            )
                                        )
                                        .map((member, i) => (
                                          <option key={i} value={member}>
                                            {member}
                                          </option>
                                        ))}
                                    </select>
                                  </div>
                                </td>
                                {subEvent.taskOrAgenda === "task" && (
                                  <td>
                                    <div className="select is-fullwidth">
                                      <select
                                        value={editTaskType}
                                        onChange={(e) =>
                                          setEditTaskType(e.target.value)
                                        }
                                        style={{
                                          fontFamily: "'Poppins', sans-serif",
                                          fontSize: "1rem",
                                          height: "2.8rem",
                                        }}
                                      >
                                        <option value="">
                                          Select Task Type
                                        </option>
                                        {taskTypes.map((type) => (
                                          <option key={type} value={type}>
                                            {type}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>
                                )}
                                <td>
                                  <button
                                    className="button is-success mr-2"
                                    onClick={handleSaveEdit}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="button"
                                    onClick={cancelEdit}
                                  >
                                    Cancel
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td>{email}</td>
                                {subEvent.taskOrAgenda === "task" && (
                                  <td>{taskType}</td>
                                )}
                                <td>
                                  <button
                                    className="button is-info mr-2"
                                    onClick={() => handleEdit(index)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="button is-danger"
                                    onClick={() => handleRemoveAssigned(email)}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: "24px" }}>
              <button
                type="submit"
                style={{
                  backgroundColor: "#0D1A2A",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "'Poppins', sans-serif",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  marginBottom: "5rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F38B40";
                  e.currentTarget.style.color = "white"; // ubah font jadi putih saat hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#0D1A2A"; // kembali ke warna asal
                  e.currentTarget.style.color = "#white"; // font kembali ke asal
                }}
              >
                Save Sub Event
              </button>
              <button
                type="button"
                onClick={() => window.history.back()} // atau ganti dengan navigate(-1) / custom onCancel
                style={{
                  color: "#0D1A2A",
                  padding: "0.75rem 1.5rem",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontFamily: "'Poppins', sans-serif",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  marginLeft: "1rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#930101";
                  e.currentTarget.style.color = "white"; // ubah font jadi putih saat hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#909090"; // kembali ke warna asal
                  e.currentTarget.style.color = "#white"; // font kembali ke asal
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Details;
