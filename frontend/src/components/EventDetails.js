import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EventDetails = () => {
  const [eventName, setEventName] = useState("");
  const [organizer, setOrganizer] = useState(""); // Organizer tetap bisa diubah
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState([""]);
  const [events, setEvents] = useState([]);
  const [eventCreatorEmail, setEventCreatorEmail] = useState(""); // State untuk email creator
  const navigate = useNavigate();

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
                    <strong>Creator:</strong> {event.creator_email || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventDetails;
