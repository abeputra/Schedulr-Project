import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bulma/css/bulma.min.css"; // pastikan Bulma diimport

const SubEventDetails = () => {
  const { eventId } = useParams();
  const [subEvents, setSubEvents] = useState([]);
  const navigate = useNavigate();

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
    <div>
      <h1>Sub Event Details for Event {eventId}</h1>

      <button
        onClick={handleAddSubEvent}
        style={{
          backgroundColor: "#007BFF",
          color: "white",
          padding: "1rem 2rem",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          border: "none",
          marginBottom: "2rem",
        }}
      >
        Add New Sub Event
      </button>

      <div className="container mt-5">
        <h2 className="title is-4">Sub Events</h2>
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
                    <p className="title is-5">{subEvent.title}</p>
                    <p className="subtitle is-6">
                      <strong>Organizer:</strong>{" "}
                      {subEvent.organizer || "Unknown"}
                    </p>
                    <p>
                      <strong>Description:</strong> {subEvent.description}
                    </p>
                  </div>

                  {/* Tombol Delete yang diperbaiki */}
                  <footer className="card-footer">
                    <div className="card-footer-item">
                      <button
                        onClick={() => handleDeleteSubEvent(subEvent.id)}
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
  );
};

export default SubEventDetails;
