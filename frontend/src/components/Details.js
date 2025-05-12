import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Details = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [invitedMembers, setInvitedMembers] = useState([]);

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
          `http://localhost:5000/api/subevents/invited-members/${eventId}`,
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
      const res = await fetch("http://localhost:5000/api/subevents", {
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
    <div style={{ padding: "24px", maxWidth: "700px" }}>
      <h2>Add Sub Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <br />
          <input
            type="text"
            name="title"
            value={subEvent.title}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Description:</label>
          <br />
          <textarea
            name="description"
            value={subEvent.description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Additional Description:</label>
          <br />
          <textarea
            name="additional_description"
            value={subEvent.additional_description}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Date:</label>
          <br />
          <input
            type="date"
            name="date"
            value={subEvent.date}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Time:</label>
          <br />
          <input
            type="time"
            name="time"
            value={subEvent.time}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Location:</label>
          <br />
          <input
            type="text"
            name="location"
            value={subEvent.location}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Task or Agenda:</label>
          <br />
          <select
            name="taskOrAgenda"
            value={subEvent.taskOrAgenda}
            onChange={handleInputChange}
          >
            <option value="task">Task Distribution</option>
            <option value="agenda">Agenda</option>
          </select>
        </div>

        {(subEvent.taskOrAgenda === "task" ||
          subEvent.taskOrAgenda === "agenda") && (
          <div style={{ marginTop: "20px" }}>
            <h3>
              {subEvent.taskOrAgenda === "task"
                ? "Assign Tasks"
                : "Assign Members"}
            </h3>

            <table>
              <thead>
                <tr>
                  <th>Assigned Member</th>
                  {subEvent.taskOrAgenda === "task" && <th>Task Type</th>}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <select
                      value={selectedMember}
                      onChange={(e) => setSelectedMember(e.target.value)}
                    >
                      <option value="">Select Member</option>
                      {invitedMembers
                        .filter(
                          (email) =>
                            !assignedTasks.some((task) => task.email === email)
                        )
                        .map((email, index) => (
                          <option key={index} value={email}>
                            {email}
                          </option>
                        ))}
                    </select>
                  </td>

                  {subEvent.taskOrAgenda === "task" && (
                    <td>
                      <select
                        value={selectedTaskType}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "__add_new__") {
                            const newType = window.prompt(
                              "Enter new task type:"
                            );
                            if (newType && !taskTypes.includes(newType)) {
                              setTaskTypes((prev) => [...prev, newType]);
                              setSelectedTaskType(newType);
                            }
                          } else {
                            setSelectedTaskType(value);
                          }
                        }}
                      >
                        <option value="">Select Task Type</option>
                        {taskTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add new...</option>
                      </select>
                    </td>
                  )}

                  <td>
                    <button type="button" onClick={handleAddAssignment}>
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            {assignedTasks.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <h4>
                  {subEvent.taskOrAgenda === "task"
                    ? "Assigned Tasks"
                    : "Assigned Members"}
                </h4>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          borderBottom: "1px solid #ccc",
                          padding: "8px",
                        }}
                      >
                        Member
                      </th>
                      {subEvent.taskOrAgenda === "task" && (
                        <th
                          style={{
                            borderBottom: "1px solid #ccc",
                            padding: "8px",
                          }}
                        >
                          Task
                        </th>
                      )}
                      <th
                        style={{
                          borderBottom: "1px solid #ccc",
                          padding: "8px",
                        }}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedTasks.map(({ email, taskType }, index) => (
                      <tr key={email}>
                        {editIndex === index ? (
                          <>
                            <td style={{ padding: "8px" }}>
                              <select
                                value={editMember}
                                onChange={(e) => setEditMember(e.target.value)}
                              >
                                {invitedMembers
                                  .filter(
                                    (member) =>
                                      member === email ||
                                      !assignedTasks.some(
                                        (t, i) =>
                                          t.email === member && i !== index
                                      )
                                  )
                                  .map((member, i) => (
                                    <option key={i} value={member}>
                                      {member}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            {subEvent.taskOrAgenda === "task" && (
                              <td style={{ padding: "8px" }}>
                                <select
                                  value={editTaskType}
                                  onChange={(e) =>
                                    setEditTaskType(e.target.value)
                                  }
                                >
                                  <option value="">Select Task Type</option>
                                  {taskTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            )}
                            <td style={{ padding: "8px" }}>
                              <button type="button" onClick={handleSaveEdit}>
                                Save
                              </button>
                              <button type="button" onClick={cancelEdit}>
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: "8px" }}>{email}</td>
                            {subEvent.taskOrAgenda === "task" && (
                              <td style={{ padding: "8px" }}>{taskType}</td>
                            )}
                            <td style={{ padding: "8px" }}>
                              <button
                                type="button"
                                onClick={() => handleEdit(index)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
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
          <button type="submit">Save Sub Event</button>
        </div>
      </form>
    </div>
  );
};

export default Details;
