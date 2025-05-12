import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PerSubEvent = () => {
  const { subeventId } = useParams();
  const [subEvent, setSubEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    date,
    time,
    location,
    task_or_agenda,
    createdAt,
    updatedAt,
    assignedtasks,
    assignedmembers,
  } = subEvent;

  return (
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
          <strong>Date:</strong> {date}
        </li>
        <li>
          <strong>Time:</strong> {time}
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
  );
};

export default PerSubEvent;
