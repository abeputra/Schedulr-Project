import React, { useState } from "react";

const ChatbotPage = () => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();

    if (!chatInput.trim()) return;

    // Tambahkan pesan user ke history
    const newMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, newMessage]);

    try {
      const response = await fetch("http://localhost:5000/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: chatInput }),
      });

      const data = await response.json();

      // Tambahkan respon bot ke history
      const botMessage = { role: "bot", content: data.reply };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
    }

    setChatInput(""); // Kosongkan input
  };

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
          chatHistory.map((msg, index) => (
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
                }}
              >
                {msg.content}
              </div>
            </div>
          ))
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
