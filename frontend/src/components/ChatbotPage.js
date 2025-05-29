import React, { useState } from "react";

// Komponen untuk menampilkan suggestedModel dengan desain rapi dan tombol kirim event & edit
const EventSuggestionCard = ({ model, onCreate, onEdit }) => {
  if (!model) return null;
  return (
    <div
      style={{
        background: "#F6F8FA",
        border: "2px solid #F38B40",
        borderRadius: "1rem",
        padding: "1.5rem 2rem",
        margin: "1.5rem 0",
        color: "#0D1A2A",
        maxWidth: "500px",
        boxShadow: "0 2px 8px rgba(243,139,64,0.08)",
      }}
    >
      <h3 style={{ color: "#F38B40", marginBottom: "1rem" }}>
        Saran Data Event
      </h3>
      <div style={{ marginBottom: "0.7rem" }}>
        <strong>Judul:</strong> {model.title}
      </div>
      <div style={{ marginBottom: "0.7rem" }}>
        <strong>Penyelenggara:</strong> {model.organizer}
      </div>
      <div style={{ marginBottom: "0.7rem" }}>
        <strong>Deskripsi:</strong> {model.description}
      </div>
      <div style={{ marginBottom: "0.7rem" }}>
        <strong>Undangan:</strong>
        <ul style={{ margin: "0.3rem 0 0 1.2rem" }}>
          {model.invited_members?.map((email, idx) => (
            <li key={idx}>{email}</li>
          ))}
        </ul>
      </div>
      <div style={{ marginBottom: "0.7rem" }}>
        <strong>User ID:</strong> {model.userId}
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <strong>Email Pembuat:</strong> {model.creator_email}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => onCreate(model)}
          style={{
            background: "#F38B40",
            color: "#fff",
            border: "none",
            borderRadius: "1rem",
            padding: "0.6rem 1.5rem",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Buat Event Ini
        </button>
        <button
          onClick={() => onEdit(model)}
          style={{
            background: "#fff",
            color: "#F38B40",
            border: "2px solid #F38B40",
            borderRadius: "1rem",
            padding: "0.6rem 1.5rem",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Edit Event
        </button>
      </div>
    </div>
  );
};

const ChatbotPage = () => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [mode, setMode] = useState("analisis");
  const [suggestedModel, setSuggestedModel] = useState(null);
  const [createStatus, setCreateStatus] = useState(""); // Untuk notifikasi
  const [editEvent, setEditEvent] = useState(null); // State untuk edit event

  // Fungsi untuk kirim event ke backend
  const handleCreateEvent = async (eventData) => {
    setCreateStatus(""); // Reset status

    // Hanya ambil field yang dibutuhkan backend
    const payload = {
      title: eventData.title,
      organizer: eventData.organizer,
      description: eventData.description,
      invited_members: eventData.invited_members,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setCreateStatus("Event berhasil dibuat!");
        setEditEvent(null);
      } else {
        setCreateStatus(data.message || "Gagal membuat event.");
      }
    } catch (err) {
      setCreateStatus("Terjadi kesalahan saat membuat event.");
    }
  };

  // Untuk mulai edit event
  const handleEditEvent = (model) => {
    setEditEvent({
      ...model,
      invited_members: Array.isArray(model.invited_members)
        ? model.invited_members
        : typeof model.invited_members === "string"
        ? model.invited_members.split(",").map((s) => s.trim())
        : [],
    });
    setCreateStatus("");
  };

  // Untuk handle perubahan input edit
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditEvent((prev) => ({
      ...prev,
      [name]:
        name === "invited_members"
          ? value.split(",").map((s) => s.trim())
          : value,
    }));
  };

  // Submit hasil edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await handleCreateEvent(editEvent);
    setEditEvent(null);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage = { role: "user", content: chatInput, mode };
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
        body: JSON.stringify({ message: chatInput, mode }),
      });

      const data = await response.json();
      let botContent = "";
      if (data.model) {
        botContent = (
          <pre style={{ margin: 0, color: "#fff" }}>
            {JSON.stringify(data.model, null, 2)}
          </pre>
        );
      } else if (data.response) {
        botContent = data.response;
      } else {
        botContent = "No response from server.";
      }

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: botContent },
      ]);
      // Set suggestedModel jika ada
      setSuggestedModel(data.suggestedModel || null);
      setEditEvent(null); // Reset edit jika ada chat baru
      setChatInput("");
    } catch (error) {
      console.error("Chatbot error:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error." },
      ]);
    }
  };

  // Email validation function (copy dari EventDetails)
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Untuk handle perubahan member di edit form
  const handleEditMemberChange = (index, value) => {
    setEditEvent((prev) => ({
      ...prev,
      invited_members: prev.invited_members.map((m, i) => (i === index ? value : m)),
    }));
  };

  const handleAddEditMember = () => {
    setEditEvent((prev) => ({
      ...prev,
      invited_members: [...prev.invited_members, ""],
    }));
  };

  const handleRemoveEditMember = (index) => {
    setEditEvent((prev) => {
      const newMembers = prev.invited_members.filter((_, i) => i !== index);
      return {
        ...prev,
        invited_members: newMembers.length === 0 ? [""] : newMembers,
      };
    });
  };

  const canAddEditMember =
    editEvent &&
    editEvent.invited_members.every(
      (email) => email.trim() !== "" && isValidEmail(email)
    );

  return (
    <div
      className="chatbot"
      style={{
        margin: "4rem auto",
        fontFamily: "'Poppins', sans-serif",
        maxWidth: "900px",
        padding: "0 2rem",
      }}
    >
      <h2
        style={{
          color: "#0D1A2A",
          fontWeight: 700,
          fontSize: "2rem",
          marginBottom: "1.5rem",
        }}
      >
        Chatbot Assistant
      </h2>

      {/* Pilihan mode */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={() => setMode("analisis")}
          style={{
            background: mode === "analisis" ? "#F38B40" : "#eee",
            color: mode === "analisis" ? "#fff" : "#0D1A2A",
            border: "none",
            borderRadius: "1rem",
            padding: "0.5rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Analisis
        </button>
        <button
          onClick={() => setMode("input_event")}
          style={{
            background: mode === "input_event" ? "#F38B40" : "#eee",
            color: mode === "input_event" ? "#fff" : "#0D1A2A",
            border: "none",
            borderRadius: "1rem",
            padding: "0.5rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Input Event
        </button>
        <button
          onClick={() => setMode("input_subevent")}
          style={{
            background: mode === "input_subevent" ? "#F38B40" : "#eee",
            color: mode === "input_subevent" ? "#fff" : "#0D1A2A",
            border: "none",
            borderRadius: "1rem",
            padding: "0.5rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Input SubEvent
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "1rem",
          boxShadow: "0 8px 10px rgba(0,0,0,0.08)",
          padding: "2rem",
          minHeight: "180px",
        }}
      >
        {chatHistory.length === 0 ? (
          <p
            style={{
              color: "#0D1A2A",
              fontWeight: 500,
              fontSize: "1.1rem",
              textAlign: "center",
            }}
          >
            Start the conversation by asking a question.
          </p>
        ) : (
          <>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    background: msg.role === "user" ? "#0D1A2A" : "#F38B40",
                    color: "#fff",
                    borderRadius:
                      msg.role === "user"
                        ? "1rem 1rem 0.2rem 1rem"
                        : "1rem 1rem 1rem 0.2rem",
                    padding: "0.7rem 1.2rem",
                    maxWidth: "70%",
                    fontWeight: 500,
                    fontSize: "1rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {/* Tampilkan saran event jika ada */}
            {editEvent ? (
              <form
                onSubmit={handleEditSubmit}
                style={{
                  background: "#F6F8FA",
                  border: "2px solid #F38B40",
                  borderRadius: "1rem",
                  padding: "1.5rem 2rem",
                  margin: "1.5rem 0",
                  maxWidth: "500px",
                }}
              >
                <h3 style={{ color: "#F38B40", marginBottom: "1rem" }}>
                  Edit Data Event
                </h3>
                <div style={{ marginBottom: "0.7rem" }}>
                  <label>
                    Judul:
                    <input
                      type="text"
                      name="title"
                      value={editEvent.title}
                      onChange={handleEditChange}
                      style={{
                        width: "100%",
                        marginTop: 4,
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "1.1rem",
                        borderRadius: "0.8rem",
                        height: "3rem",
                        marginBottom: "1rem",
                      }}
                      required
                    />
                  </label>
                </div>
                <div style={{ marginBottom: "0.7rem" }}>
                  <label>
                    Penyelenggara:
                    <input
                      type="text"
                      name="organizer"
                      value={editEvent.organizer}
                      onChange={handleEditChange}
                      style={{
                        width: "100%",
                        marginTop: 4,
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "1.1rem",
                        borderRadius: "0.8rem",
                        height: "3rem",
                        marginBottom: "1rem",
                      }}
                      required
                    />
                  </label>
                </div>
                <div style={{ marginBottom: "0.7rem" }}>
                  <label>
                    Deskripsi:
                    <textarea
                      name="description"
                      value={editEvent.description}
                      onChange={handleEditChange}
                      style={{
                        width: "100%",
                        marginTop: 4,
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "1.1rem",
                        borderRadius: "0.8rem",
                        height: "3.5rem",
                        marginBottom: "1rem",
                      }}
                      required
                    />
                  </label>
                </div>
                <div style={{ marginBottom: "0.7rem" }}>
                  <label>
                    Invite Members:
                    {editEvent.invited_members.map((member, idx) => {
                      const invalid = member && !isValidEmail(member);
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                            position: "relative",
                          }}
                        >
                          <input
                            type="email"
                            value={member}
                            onChange={(e) => handleEditMemberChange(idx, e.target.value)}
                            required
                            placeholder="Enter member's email"
                            style={{
                              flex: 1,
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: "1.1rem",
                              borderRadius: "0.8rem",
                              height: "3rem",
                              borderColor: invalid ? "red" : "",
                              boxShadow: invalid ? "0 0 5px red" : "",
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddEditMember}
                            disabled={!canAddEditMember}
                            style={{
                              height: "3rem",
                              borderRadius: "0.8rem",
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: "1.1rem",
                              background: "#F38B40",
                              color: "#fff",
                              border: "none",
                              cursor: canAddEditMember ? "pointer" : "not-allowed",
                            }}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveEditMember(idx)}
                            disabled={editEvent.invited_members.length === 1}
                            style={{
                              height: "3rem",
                              borderRadius: "0.8rem",
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: "1.1rem",
                              background: "#909090",
                              color: "#fff",
                              border: "none",
                              cursor:
                                editEvent.invited_members.length === 1
                                  ? "not-allowed"
                                  : "pointer",
                              opacity: editEvent.invited_members.length === 1 ? 0.5 : 1,
                            }}
                          >
                            Remove
                          </button>
                          {invalid && (
                            <span
                              style={{
                                position: "absolute",
                                left: 0,
                                top: "100%",
                                color: "#721c24",
                                background: "#f8d7da",
                                border: "1px solid #f5c6cb",
                                borderRadius: "4px",
                                padding: "2px 8px",
                                fontSize: "0.9rem",
                                marginTop: "2px",
                              }}
                            >
                              Invalid email address!
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </label>
                </div>
                <button
                  type="submit"
                  style={{
                    background: "#F38B40",
                    color: "#fff",
                    border: "none",
                    borderRadius: "1rem",
                    padding: "0.6rem 1.5rem",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: "0.5rem",
                  }}
                >
                  Simpan & Buat Event
                </button>
                <button
                  type="button"
                  onClick={() => setEditEvent(null)}
                  style={{
                    marginLeft: "1rem",
                    background: "#fff",
                    color: "#F38B40",
                    border: "2px solid #F38B40",
                    borderRadius: "1rem",
                    padding: "0.6rem 1.5rem",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: "0.5rem",
                  }}
                >
                  Batal
                </button>
                {createStatus && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      color: createStatus.includes("berhasil") ? "green" : "red",
                      fontWeight: 500,
                    }}
                  >
                    {createStatus}
                  </div>
                )}
              </form>
            ) : (
              suggestedModel && (
                <>
                  <EventSuggestionCard
                    model={suggestedModel}
                    onCreate={handleCreateEvent}
                    onEdit={handleEditEvent}
                  />
                  {createStatus && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        color: createStatus.includes("berhasil")
                          ? "green"
                          : "red",
                        fontWeight: 500,
                      }}
                    >
                      {createStatus}
                    </div>
                  )}
                </>
              )
            )}
          </>
        )}
      </div>

      <form
        onSubmit={handleChatSubmit}
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            borderRadius: "2rem",
            border: "2px solid #0D1A2A",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "1rem",
            padding: "0.8rem 1.2rem",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#0D1A2A",
            color: "#fff",
            borderRadius: "2rem",
            fontWeight: 600,
            fontFamily: "'Poppins', sans-serif",
            fontSize: "1rem",
            padding: "0.8rem 2rem",
            border: "none",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatbotPage;
