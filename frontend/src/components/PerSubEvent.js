import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PerSubEvent = () => {
  const { subeventId } = useParams();

  const [subEvent, setSubEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("");
  const [taskTypes, setTaskTypes] = useState([
    "Documentation",
    "Logistics",
    "Design",
  ]);

  const [editIndex, setEditIndex] = useState(null);
  const [editMember, setEditMember] = useState("");
  const [editTaskType, setEditTaskType] = useState("");
  const [eventId, setEventId] = useState(null);

  // Fetch sub-event detail
  useEffect(() => {
    const fetchSubEvent = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/subevents/detail/${subeventId}`,
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
          `http://localhost:5000/api/events/${data.eventId}`, // pastikan API ini tersedia
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
          `http://localhost:5000/api/subevents/invited-members/${eventId}`,
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
        `http://localhost:5000/api/subevents/detail/${subeventId}`,
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
    <div style={{ padding: "2rem" }}>
      <h1>Sub-Event Detail</h1>
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
      >
        Edit
      </button>

      <ul>
        <li>
          <b>Title:</b> {subEvent.title}
        </li>
        <li>
          <b>Description:</b> {subEvent.description}
        </li>
        <li>
          <b>Date:</b> {subEvent.date}
        </li>
        <li>
          <b>Time:</b> {subEvent.time}
        </li>
        <li>
          <b>Location:</b> {subEvent.location}
        </li>
        <li>
          <b>Type:</b> {subEvent.task_or_agenda}
        </li>
      </ul>

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
        <h2>Edit Sub-Event</h2>
        <input
          name="title"
          value={editData.title}
          onChange={handleEditChange}
          placeholder="Title"
        />
        <textarea
          name="description"
          value={editData.description}
          onChange={handleEditChange}
          placeholder="Description"
        />
        <input
          name="date"
          type="date"
          value={editData.date}
          onChange={handleEditChange}
        />
        <input
          name="time"
          type="time"
          value={editData.time}
          onChange={handleEditChange}
        />
        <input
          name="location"
          value={editData.location}
          onChange={handleEditChange}
          placeholder="Location"
        />

        <select
          name="task_or_agenda"
          value={editData.task_or_agenda}
          onChange={handleEditChange}
        >
          <option value="task">Task</option>
          <option value="agenda">Agenda</option>
        </select>

        <h4>
          {editData.task_or_agenda === "task" ? "Assign Task" : "Assign Member"}
        </h4>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">Select Member</option>
          {invitedMembers
            .filter((em) => {
              if (editData.task_or_agenda === "task") {
                return !editData.assignedtasks.some((t) => t.email === em);
              } else {
                return !editData.assignedmembers.includes(em);
              }
            })
            .map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
        </select>

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

        <button onClick={handleAddAssignment}>Add</button>

        {editData.task_or_agenda === "task" ? (
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Email</th>
                <th>Task Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {editData.assignedtasks.map((task, index) => (
                <tr key={index}>
                  <td>{task.email}</td>
                  <td>{task.taskType}</td>
                  <td>
                    <button onClick={() => handleEdit(index)}>Edit</button>
                    <button onClick={() => handleRemoveAssigned(task.email)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul>
            {editData.assignedmembers.map((email, index) => (
              <li key={index}>
                {email}{" "}
                <button onClick={() => handleRemoveAssigned(email)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <button onClick={saveChanges}>Save</button>
        <button onClick={closeModal}>Cancel</button>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: "2rem",
    borderRadius: 8,
    width: "100%",
    maxWidth: 700,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};

export default PerSubEvent;
