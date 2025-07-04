import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

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
import backgroundMotif from "../assets/background-motif.png";

const PerSubEvent = () => {
  const { subeventId } = useParams();
  const [showModal, setShowModal] = useState(false);

  const [subEvent, setSubEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("");
  const [taskTypes, setTaskTypes] = useState([
    "Fotografer",
    "Videografer",
    "Notulen",
  ]);

  const [editIndex, setEditIndex] = useState(null);
  const [editMember, setEditMember] = useState("");
  const [editTaskType, setEditTaskType] = useState("");
  const [eventId, setEventId] = useState(null);
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

  // Fetch sub-event detail
  useEffect(() => {
    const fetchSubEvent = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://20.115.99.118:5000/api/subevents/detail/${subeventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch sub-event");
        const data = await res.json();

        console.log("SubEvent Detail (id:", data.id, "):", data);
        console.log("Event ID (eventId):", data.eventId);

        setSubEvent(data);
        setEventId(data.eventId);

        // Fetch related event data
        const eventRes = await fetch(
          `http://20.115.99.118:5000/api/events/${data.eventId}`, // pastikan API ini tersedia
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!eventRes.ok) throw new Error("Failed to fetch event data");
        const eventData = await eventRes.json();
        console.log("Event Detail (eventId:", data.eventId, "):", eventData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubEvent();
  }, [subeventId]);

  // Fetch invited members only when editing tasks
  useEffect(() => {
    const fetchInvitedMembers = async () => {
      if (!isEditing || !eventId || subEvent?.task_or_agenda !== "task") return;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://20.115.99.118:5000/api/subevents/invited-members/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch invited members");

        const data = await res.json();
        setInvitedMembers(data);
      } catch (err) {
        console.error("Error fetching invited members:", err.message);
      }
    };

    fetchInvitedMembers();
  }, [isEditing, eventId, subEvent?.task_or_agenda]);

  const handleEditChange = (e) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddAssignment = () => {
    if (!selectedMember) return;

    if (editData.task_or_agenda === "task" && selectedTaskType) {
      if (!editData.assignedtasks.some((t) => t.email === selectedMember)) {
        setEditData((prev) => ({
          ...prev,
          assignedtasks: [
            ...prev.assignedtasks,
            { email: selectedMember, taskType: selectedTaskType },
          ],
        }));
      }
    } else if (editData.task_or_agenda === "agenda") {
      if (!editData.assignedmembers.includes(selectedMember)) {
        setEditData((prev) => ({
          ...prev,
          assignedmembers: [...prev.assignedmembers, selectedMember],
        }));
      }
    }

    setSelectedMember("");
    setSelectedTaskType("");
  };

  const handleRemoveAssigned = (email) => {
    if (editData.task_or_agenda === "task") {
      setEditData((prev) => ({
        ...prev,
        assignedtasks: prev.assignedtasks.filter((t) => t.email !== email),
      }));
    } else {
      setEditData((prev) => ({
        ...prev,
        assignedmembers: prev.assignedmembers.filter((em) => em !== email),
      }));
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    const task = editData.assignedtasks[index];
    setEditMember(task.email);
    setEditTaskType(task.taskType);
  };

  const handleSaveEdit = () => {
    setEditData((prev) => {
      const updated = [...prev.assignedtasks];
      updated[editIndex] = { email: editMember, taskType: editTaskType };
      return { ...prev, assignedtasks: updated };
    });
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditMember("");
    setEditTaskType("");
  };

  const saveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://20.115.99.118:5000/api/subevents/detail/${subeventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Update failed:", errorData.message);
        alert("Gagal memperbarui sub-event.");
        return;
      }

      const updatedSubEvent = await res.json();
      console.log("Sub-event updated:", updatedSubEvent);

      // ✅ Beri notifikasi sukses
      alert("Data berhasil diperbarui!");

      // ✅ Refresh halaman
      window.location.reload();
    } catch (err) {
      console.error("Error while saving changes:", err);
      alert("Terjadi kesalahan saat menyimpan perubahan.");
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!subEvent) return null;

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
      <div
        style={{
          padding: "2rem",
          color: "#0D1A2A",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "normal",
          fontSize: "1rem",
          letterSpacing: "0.05em",
        }}
      >
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
          Sub Event Detail
        </h1>

        <div
          style={{
            backgroundColor: "#0D1A2A",
            padding: "2rem",
            borderRadius: "12px",
            marginTop: "2rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li
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
            </li>
            <li
              style={{
                color: "#FFFFFF",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "normal",
                fontSize: "1.5rem",
                marginTop: "0.7rem",
                letterSpacing: "0.05em",
                marginBottom: "1rem",
              }}
            >
              Description:
              <span style={{ marginLeft: "3.7rem" }}>
                : {subEvent.description}
              </span>
            </li>
            <li
              style={{
                color: "#FFFFFF",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "normal",
                fontSize: "1.5rem",
                marginTop: "0.7rem",
                letterSpacing: "0.05em",
                marginBottom: "1rem",
              }}
            >
              Date:
              <span style={{ marginLeft: "9rem" }}>: {subEvent.date}</span>
            </li>
            <li
              style={{
                color: "#FFFFFF",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "normal",
                fontSize: "1.5rem",
                marginTop: "0.7rem",
                letterSpacing: "0.05em",
                marginBottom: "1rem",
              }}
            >
              Time:
              <span style={{ marginLeft: "9rem" }}>: {subEvent.time}</span>
            </li>
            <li
              style={{
                color: "#FFFFFF",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "normal",
                fontSize: "1.5rem",
                marginTop: "0.7rem",
                letterSpacing: "0.05em",
                marginBottom: "1rem",
              }}
            >
              Location:
              <span style={{ marginLeft: "6rem" }}>: {subEvent.location}</span>
            </li>
            <li
              style={{
                color: "#FFFFFF",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: "normal",
                fontSize: "1.5rem",
                marginTop: "0.7rem",
                letterSpacing: "0.05em",
                marginBottom: "1rem",
              }}
            >
              Type:
              <span style={{ marginLeft: "9rem" }}>
                : {subEvent.task_or_agenda}
              </span>
            </li>

            {/* Assigned Section */}
            {Array.isArray(subEvent.assignedtasks) &&
            subEvent.assignedtasks.length > 0 ? (
              <div
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "normal",
                  fontSize: "1.5rem",
                  marginTop: "3rem",
                  letterSpacing: "0.05em",
                  marginBottom: "1rem",
                }}
              >
                <b>Assigned Tasks:</b>
                <ul>
                  {subEvent.assignedtasks.map((task, i) => (
                    <li key={i}>
                      {i + 1}. {task.email} as {task.taskType}
                    </li>
                  ))}
                </ul>
              </div>
            ) : subEvent.assignedmembers ? (
              <div
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "normal",
                  fontSize: "1.5rem",
                  marginTop: "0.7rem",
                  letterSpacing: "0.05em",
                  marginBottom: "1rem",
                }}
              >
                <h3>Assigned Members:</h3>
                <ul>
                  {(Array.isArray(subEvent.assignedmembers)
                    ? subEvent.assignedmembers
                    : typeof subEvent.assignedmembers === "string"
                    ? subEvent.assignedmembers.split(",")
                    : []
                  ).map((member, i) => (
                    <li key={i}>
                      {i + 1}. {member.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </ul>
        </div>
        <button
          onClick={() => {
            setEditData({
              title: subEvent.title || "",
              description: subEvent.description || "",
              date: subEvent.date || "",
              time: subEvent.time || "",
              location: subEvent.location || "",
              task_or_agenda: subEvent.task_or_agenda || "task",
              assignedtasks: subEvent.assignedtasks || [],
              assignedmembers: subEvent.assignedmembers || [],
            });
            setIsEditing(true);
          }}
          style={{
            padding: "0.8rem 2rem",
            backgroundColor: "#F0F4F8",
            color: "#0D1A2A",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: "bold",
            fontSize: "1.1rem",
            letterSpacing: "0.05em",
            border: "2px solid #0D1A2A",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s ease, transform 0.2s ease",
            marginTop: "2rem",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#e0e7ef";
            e.target.style.transform = "scale(1.02)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#F0F4F8";
            e.target.style.transform = "scale(1)";
          }}
        >
          Edit
        </button>

        {isEditing && (
          <EditModal
            editData={editData}
            setEditData={setEditData}
            invitedMembers={invitedMembers}
            taskTypes={taskTypes}
            setTaskTypes={setTaskTypes}
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            selectedTaskType={selectedTaskType}
            setSelectedTaskType={setSelectedTaskType}
            handleAddAssignment={handleAddAssignment}
            handleRemoveAssigned={handleRemoveAssigned}
            handleEditChange={handleEditChange}
            handleEdit={handleEdit}
            editIndex={editIndex}
            editMember={editMember}
            setEditMember={setEditMember}
            editTaskType={editTaskType}
            setEditTaskType={setEditTaskType}
            handleSaveEdit={handleSaveEdit}
            cancelEdit={cancelEdit}
            saveChanges={saveChanges}
            closeModal={() => setIsEditing(false)}
          />
        )}
      </div>
    </div>
  );
};

// You can modularize the edit modal to keep the main component clean.
const EditModal = ({
  editData,
  setEditData,
  invitedMembers,
  taskTypes,
  setTaskTypes,
  selectedMember,
  setSelectedMember,
  selectedTaskType,
  setSelectedTaskType,
  handleAddAssignment,
  handleRemoveAssigned,
  handleEditChange,
  handleEdit,
  editIndex,
  editMember,
  setEditMember,
  editTaskType,
  setEditTaskType,
  handleSaveEdit,
  cancelEdit,
  saveChanges,
  closeModal,
}) => {
  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h2
          className="title is-4"
          style={{
            color: "#0D1A2A",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "2rem", // misalnya 2rem = 32px
          }}
        >
          Edit Sub-Event
        </h2>

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
          Sub Event Title
        </label>
        <input
          className="input"
          name="title"
          value={editData.title}
          onChange={handleEditChange}
          placeholder="Enter your SUb Event Title"
          style={{
            fontSize: "1.1rem",
            marginTop: "0rem",
            marginBottom: "1rem",
            fontStyle: "italic",
            backgroundColor: "#0D1A2A",
          }}
        />
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
          Sub Event Description
        </label>
        <textarea
          className="textarea"
          name="description"
          value={editData.description}
          onChange={handleEditChange}
          placeholder="Enter your Sub Event Description"
          style={{
            fontSize: "1.1rem",
            marginBottom: "1rem",
            fontStyle: "italic",
            backgroundColor: "#0D1A2A",
          }}
        />
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
          Date
        </label>
        <input
          className="input"
          name="date"
          type="date"
          value={editData.date}
          onChange={handleEditChange}
          style={{
            fontSize: "1.1rem",
            marginBottom: "1rem",
            fontStyle: "italic",
            backgroundColor: "#0D1A2A",
          }}
        />
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
          Time
        </label>
        <input
          className="input"
          name="time"
          type="time"
          value={editData.time}
          onChange={handleEditChange}
          style={{
            fontSize: "1.1rem",
            marginBottom: "1rem",
            fontStyle: "italic",
            backgroundColor: "#0D1A2A",
          }}
        />
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
          Location
        </label>
        <input
          className="input"
          name="location"
          value={editData.location}
          onChange={handleEditChange}
          placeholder="Location"
          style={{
            fontSize: "1.1rem",
            marginBottom: "1rem",
            fontStyle: "italic",
            backgroundColor: "#0D1A2A",
          }}
        />
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
          Task or Agenda
        </label>

        <select
          name="task_or_agenda"
          value={editData.task_or_agenda}
          onChange={handleEditChange}
          className="input"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontStyle: "italic",
            fontSize: "1.2rem",
            height: "3.5rem",
            borderRadius: "0.8rem",
            marginTop: "0rem",
            marginBottom: "1rem",
            backgroundColor: "#0d1a2a",
          }}
        >
          <option value="task">Task</option>
          <option value="agenda">Agenda</option>
        </select>

        <h3
          style={{
            color: "#0D1A2A",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
            fontSize: "1.2rem",
            marginTop: "1rem",
          }}
        >
          {editData.task_or_agenda === "task" ? "Assign Task" : "Assign Member"}
        </h3>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          {/* Member select */}
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            style={{
              flex: 1,
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1rem",
              height: "3rem",
              borderRadius: "0.6rem",
              backgroundColor: "#FFFFFF",
              color: "#0D1A2A",
            }}
          >
            <option value="">Select Member</option>
            {invitedMembers
              .filter((em) =>
                editData.task_or_agenda === "task"
                  ? !editData.assignedtasks.some((t) => t.email === em)
                  : !editData.assignedmembers.includes(em)
              )
              .map((em) => (
                <option key={em} value={em}>
                  {em}
                </option>
              ))}
          </select>

          {/* Task type select (only for task) */}
          {editData.task_or_agenda === "task" && (
            <select
              value={selectedTaskType}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "__add_new__") {
                  const newType = prompt("Enter new task type:");
                  if (newType && !taskTypes.includes(newType)) {
                    setTaskTypes([...taskTypes, newType]);
                    setSelectedTaskType(newType);
                  }
                } else {
                  setSelectedTaskType(value);
                }
              }}
              style={{
                flex: 1,
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1rem",
                height: "3rem",
                borderRadius: "0.6rem",
                backgroundColor: "#FFFFFF",
                color: "#0D1A2A",
              }}
            >
              <option value="">Select Task Type</option>
              {taskTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="__add_new__">+ Add new...</option>
            </select>
          )}

          <button
            onClick={handleAddAssignment}
            style={{
              height: "3rem",
              padding: "0 1rem",
              borderRadius: "0.6rem",
              backgroundColor: "#F38B40",
              color: "#fff",
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FF6A00";
              e.currentTarget.style.color = "white"; // ubah font jadi putih saat hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F38B40"; // kembali ke warna asal
              e.currentTarget.style.color = "#0D1A2A"; // font kembali ke asal
            }}
          >
            Add
          </button>
        </div>

        {/* Table Display */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#0D1A2A",
            borderRadius: "0.8rem",
            overflow: "hidden",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "0.95rem",
          }}
        >
          <tbody>
            {editData.task_or_agenda === "task"
              ? editData.assignedtasks.map((task, index) => (
                  <tr
                    key={index}
                    style={{ borderBottom: "1px solid #ddd", color: "#FFFFFF" }}
                  >
                    <td
                      style={{
                        padding: "0.75rem",
                        fontSize: "1rem",
                        marginTop: "1rem",
                      }}
                    >
                      {task.email}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "1rem" }}>
                      {task.taskType}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <button
                        onClick={() => handleEdit(index)}
                        style={{
                          marginRight: "0.5rem",
                          padding: "0.3rem 0.8rem",
                          borderRadius: "0.4rem",
                          border: "none",
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          cursor: "pointer",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#FF6A00";
                          e.currentTarget.style.color = "white"; // ubah font jadi putih saat hover
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#F38B40"; // kembali ke warna asal
                          e.currentTarget.style.color = "#0D1A2A"; // font kembali ke asal
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveAssigned(task.email)}
                        style={{
                          padding: "0.3rem 0.8rem",
                          borderRadius: "0.4rem",
                          border: "none",
                          backgroundColor: "#930101",
                          color: "#fff",
                          cursor: "pointer",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#909090";
                          e.currentTarget.style.color = "white"; // ubah font jadi putih saat hover
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#930101"; // kembali ke warna asal
                          e.currentTarget.style.color = "white"; // font kembali ke asal
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              : editData.assignedmembers.map((email, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "0.75rem" }}>{email}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <button onClick={() => handleRemoveAssigned(email)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        <button
          onClick={saveChanges}
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
            marginTop: "1rem",
            marginBottom: "0.5rem",
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
          Save
        </button>
        <button
          onClick={closeModal}
          style={{
            backgroundColor: "#930101",
            color: "#FFFFFF",
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
            e.currentTarget.style.backgroundColor = "#909090";
            e.currentTarget.style.color = "white"; // ubah font jadi putih saat hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#930101"; // kembali ke warna asal
            e.currentTarget.style.color = "white"; // font kembali ke asal
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem", // supaya modal tidak menempel banget ke pinggir layar
    zIndex: 1000,
    overflow: "hidden", // supaya halaman belakang tidak scroll
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "80vh", // maksimal tinggi modal 80% viewport height
    overflowY: "auto", // scroll jika konten terlalu tinggi
    padding: "20px",
    boxSizing: "border-box",
  },
};

export default PerSubEvent;
